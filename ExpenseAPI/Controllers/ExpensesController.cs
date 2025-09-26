using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using ExpenseAPI.DTOs;

namespace ExpenseAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public ExpensesController(ExpenseDbContext context)
        {
            _context = context;
        }

        // GET: api/Expenses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetExpenses()
        {
            try
            {
                // Use a more reliable query approach
                var expenses = await (from e in _context.Expenses
                                    join c in _context.Categories on e.CategoryId equals c.Id
                                    join s in _context.SubCategories on e.SubCategoryId equals s.Id
                                    select new
                                    {
                                        e.Id,
                                        e.Name,
                                        e.Description,
                                        e.Amount,
                                        e.Date,
                                        e.CategoryId,
                                        e.SubCategoryId,
                                        CategoryName = c.Name,
                                        SubCategoryName = s.Name
                                    }).ToListAsync();

                return expenses;
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

                // Validate that the category exists
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == updateDto.CategoryId);
                if (!categoryExists)
                {
                    return BadRequest("Invalid CategoryId. Category does not exist.");
                }

                // Validate that the subcategory exists and belongs to the specified category
                var subCategoryExists = await _context.SubCategories
                    .AnyAsync(sc => sc.Id == updateDto.SubCategoryId && sc.CategoryId == updateDto.CategoryId);
                if (!subCategoryExists)
                {
                    return BadRequest("Invalid SubCategoryId or SubCategory does not belong to the specified Category.");
                }

                existingExpense.Name = updateDto.Name;
                existingExpense.Description = updateDto.Description;
                existingExpense.Amount = updateDto.Amount;
                existingExpense.Date = updateDto.Date;
                existingExpense.CategoryId = updateDto.CategoryId;
                existingExpense.SubCategoryId = updateDto.SubCategoryId;

                await _context.SaveChangesAsync();
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
                // Validate that the category exists
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == createDto.CategoryId);
                if (!categoryExists)
                {
                    return BadRequest("Invalid CategoryId. Category does not exist.");
                }

                // Validate that the subcategory exists and belongs to the specified category
                var subCategoryExists = await _context.SubCategories
                    .AnyAsync(sc => sc.Id == createDto.SubCategoryId && sc.CategoryId == createDto.CategoryId);
                if (!subCategoryExists)
                {
                    return BadRequest("Invalid SubCategoryId or SubCategory does not belong to the specified Category.");
                }

                var expense = new Expense
                {
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Amount = createDto.Amount,
                    Date = createDto.Date,
                    CategoryId = createDto.CategoryId,
                    SubCategoryId = createDto.SubCategoryId
                };

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();

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

                return new
                {
                    TotalExpenses = totalExpenses,
                    TotalCategories = totalCategories,
                    TotalSubCategories = totalSubCategories,
                    OrphanedExpenses = orphanedExpenses,
                    HasOrphanedData = orphanedExpenses.Any()
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