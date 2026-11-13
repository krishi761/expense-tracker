using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using ExpenseAPI.DTOs;
using ExpenseAPI.Services;

namespace ExpenseAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseDbContext _context;
        private readonly RedisCacheService _cache;
        private readonly SqlServerIdentityService _identityService;

        public ExpensesController(
            ExpenseDbContext context,
            RedisCacheService cache,
            SqlServerIdentityService identityService)
        {
            _context = context;
            _cache = cache;
            _identityService = identityService;
        }

        // GET: api/Expenses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetExpenses(
            [FromQuery] string source = "redis",
            CancellationToken cancellationToken = default)
        {
            if (!string.Equals(source, "redis", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(source, "sql", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Invalid source. Use 'redis' or 'sql'.");
            }

            try
            {
                var expensesQuery =
                    from e in _context.Expenses.AsNoTracking()
                    join c in _context.Categories.AsNoTracking() on e.CategoryId equals c.Id
                    join s in _context.SubCategories.AsNoTracking() on e.SubCategoryId equals s.Id
                    select new ExpenseListItemDto
                    {
                        Id = e.Id,
                        Name = e.Name,
                        Description = e.Description,
                        Amount = e.Amount,
                        Date = e.Date,
                        CategoryId = e.CategoryId,
                        SubCategoryId = e.SubCategoryId,
                        CategoryName = c.Name,
                        SubCategoryName = s.Name
                    };

                if (string.Equals(source, "sql", StringComparison.OrdinalIgnoreCase))
                {
                    return await expensesQuery.ToListAsync(cancellationToken);
                }

                return await _cache.GetOrCreateAsync(
                    "expenses:all",
                    () => expensesQuery.ToListAsync(cancellationToken),
                    cancellationToken);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // GET: api/Expenses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            try
            {
                var expense = await _context.Expenses
                    .Include(e => e.Category)
                    .Include(e => e.SubCategory)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (expense == null)
                {
                    return NotFound();
                }

                return expense;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // PUT: api/Expenses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExpense(int id, CreateExpenseDto updateDto)
        {
            try
            {
                var existingExpense = await _context.Expenses.FindAsync(id);
                if (existingExpense == null)
                {
                    return NotFound();
                }

                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == updateDto.CategoryId);
                if (category == null)
                {
                    return BadRequest("Invalid CategoryId. Category does not exist.");
                }

                var subCategory = await _context.SubCategories
                    .FirstOrDefaultAsync(sc =>
                        sc.Id == updateDto.SubCategoryId &&
                        sc.CategoryId == updateDto.CategoryId);
                if (subCategory == null)
                {
                    return BadRequest("Invalid SubCategoryId or SubCategory does not belong to the specified Category.");
                }

                existingExpense.Name = updateDto.Name;
                existingExpense.Description = updateDto.Description;
                existingExpense.Amount = updateDto.Amount;
                existingExpense.Date = updateDto.Date;
                existingExpense.Category = category;
                existingExpense.CategoryId = category.Id;
                existingExpense.SubCategory = subCategory;
                existingExpense.SubCategoryId = subCategory.Id;

                await _context.SaveChangesAsync();
                await _cache.RemoveAsync("expenses:all");
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExpenseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    return StatusCode(409, "The expense was modified by another user. Please refresh and try again.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // POST: api/Expenses
        [HttpPost]
        public async Task<ActionResult<Expense>> PostExpense(CreateExpenseDto createDto)
        {
            try
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == createDto.CategoryId);
                if (category == null)
                {
                    return BadRequest("Invalid CategoryId. Category does not exist.");
                }

                var subCategory = await _context.SubCategories
                    .FirstOrDefaultAsync(sc =>
                        sc.Id == createDto.SubCategoryId &&
                        sc.CategoryId == createDto.CategoryId);
                if (subCategory == null)
                {
                    return BadRequest("Invalid SubCategoryId or SubCategory does not belong to the specified Category.");
                }

                var expense = new Expense
                {
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Amount = createDto.Amount,
                    Date = createDto.Date,
                    Category = category,
                    CategoryId = category.Id,
                    SubCategory = subCategory,
                    SubCategoryId = subCategory.Id
                };

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();
                await _cache.RemoveAsync("expenses:all");

                return CreatedAtAction("GetExpense", new { id = expense.Id }, expense);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // DELETE: api/Expenses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                var expense = await _context.Expenses.FindAsync(id);
                if (expense == null)
                {
                    return NotFound();
                }

                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();
                await _identityService.ReseedExpensesAsync();
                await _cache.RemoveAsync("expenses:all");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // GET: api/Expenses/diagnostics
        [HttpGet("diagnostics")]
        public async Task<ActionResult<object>> GetExpensesDiagnostics()
        {
            try
            {
                var totalExpenses = await _context.Expenses.CountAsync();
                var totalCategories = await _context.Categories.CountAsync();
                var totalSubCategories = await _context.SubCategories.CountAsync();
                
                // Check for orphaned expenses
                var orphanedExpenses = await _context.Expenses
                    .Where(e => !_context.Categories.Any(c => c.Id == e.CategoryId) ||
                               !_context.SubCategories.Any(s => s.Id == e.SubCategoryId))
                    .Select(e => new { e.Id, e.Name, e.CategoryId, e.SubCategoryId })
                    .ToListAsync();

                var categoryMismatches = await _context.Expenses
                    .Where(e => _context.SubCategories.Any(s =>
                        s.Id == e.SubCategoryId && s.CategoryId != e.CategoryId))
                    .Select(e => new { e.Id, e.Name, e.CategoryId, e.SubCategoryId })
                    .ToListAsync();

                return new
                {
                    TotalExpenses = totalExpenses,
                    TotalCategories = totalCategories,
                    TotalSubCategories = totalSubCategories,
                    OrphanedExpenses = orphanedExpenses,
                    HasOrphanedData = orphanedExpenses.Any(),
                    CategoryMismatches = categoryMismatches,
                    HasCategoryMismatches = categoryMismatches.Any()
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Diagnostics error: {ex.Message}");
            }
        }

        private bool ExpenseExists(int id)
        {
            return _context.Expenses.Any(e => e.Id == id);
        }
    }
}