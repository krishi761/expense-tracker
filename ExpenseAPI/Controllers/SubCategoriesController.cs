using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Data;
using ExpenseAPI.Models;
using ExpenseAPI.DTOs;

namespace ExpenseAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubCategoriesController : ControllerBase
    {
        private readonly ExpenseDbContext _context;

        public SubCategoriesController(ExpenseDbContext context)
        {
            _context = context;
        }

        // GET: api/SubCategories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSubCategories()
        {
            try
            {
                return await _context.SubCategories
                    .Include(sc => sc.Category)
                    .Select(sc => new
                    {
                        sc.Id,
                        sc.Name,
                        sc.Description,
                        sc.CategoryId,
                        CategoryName = sc.Category.Name
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // GET: api/SubCategories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SubCategory>> GetSubCategory(int id)
        {
            try
            {
                var subCategory = await _context.SubCategories
                    .Include(sc => sc.Category)
                    .FirstOrDefaultAsync(sc => sc.Id == id);

                if (subCategory == null)
                {
                    return NotFound();
                }

                return subCategory;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // GET: api/SubCategories/ByCategory/5
        [HttpGet("ByCategory/{categoryId}")]
        public async Task<ActionResult<IEnumerable<SubCategory>>> GetSubCategoriesByCategory(int categoryId)
        {
            try
            {
                return await _context.SubCategories
                    .Where(sc => sc.CategoryId == categoryId)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // PUT: api/SubCategories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSubCategory(int id, CreateSubCategoryDto updateDto)
        {
            try
            {
                var existingSubCategory = await _context.SubCategories.FindAsync(id);
                if (existingSubCategory == null)
                {
                    return NotFound();
                }

                // Validate that the category exists
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == updateDto.CategoryId);
                if (!categoryExists)
                {
                    return BadRequest("Invalid CategoryId. Category does not exist.");
                }

                existingSubCategory.Name = updateDto.Name;
                existingSubCategory.Description = updateDto.Description;
                existingSubCategory.CategoryId = updateDto.CategoryId;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SubCategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    return StatusCode(409, "The subcategory was modified by another user. Please refresh and try again.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // POST: api/SubCategories
        [HttpPost]
        public async Task<ActionResult<SubCategory>> PostSubCategory(CreateSubCategoryDto createDto)
        {
            try
            {
                // Validate that the category exists
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == createDto.CategoryId);
                if (!categoryExists)
                {
                    return BadRequest("Invalid CategoryId. Category does not exist.");
                }

                var subCategory = new SubCategory
                {
                    Name = createDto.Name,
                    Description = createDto.Description,
                    CategoryId = createDto.CategoryId
                };
                
                _context.SubCategories.Add(subCategory);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetSubCategory", new { id = subCategory.Id }, subCategory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // DELETE: api/SubCategories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubCategory(int id)
        {
            try
            {
                var subCategory = await _context.SubCategories.FindAsync(id);
                if (subCategory == null)
                {
                    return NotFound();
                }

                _context.SubCategories.Remove(subCategory);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        private bool SubCategoryExists(int id)
        {
            return _context.SubCategories.Any(e => e.Id == id);
        }
    }
}