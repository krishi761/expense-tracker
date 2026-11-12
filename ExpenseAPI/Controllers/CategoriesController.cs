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
    public class CategoriesController : ControllerBase
    {
        private readonly ExpenseDbContext _context;
        private readonly RedisCacheService _cache;
        private readonly SqlServerIdentityService _identityService;

        public CategoriesController(
            ExpenseDbContext context,
            RedisCacheService cache,
            SqlServerIdentityService identityService)
        {
            _context = context;
            _cache = cache;
            _identityService = identityService;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            try
            {
                return await _cache.GetOrCreateAsync(
                    "categories:all",
                    () => _context.Categories.AsNoTracking().ToListAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                {
                    return NotFound();
                }

                return category;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, CreateCategoryDto updateDto)
        {
            try
            {
                var existingCategory = await _context.Categories.FindAsync(id);
                if (existingCategory == null)
                {
                    return NotFound();
                }

                existingCategory.Name = updateDto.Name;
                existingCategory.Description = updateDto.Description;

                await _context.SaveChangesAsync();
                await InvalidateCategoryDataAsync(id);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    return StatusCode(409, "The category was modified by another user. Please refresh and try again.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(CreateCategoryDto createDto)
        {
            try
            {
                var category = new Category
                {
                    Name = createDto.Name,
                    Description = createDto.Description
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                await InvalidateCategoryDataAsync(category.Id);

                return CreatedAtAction("GetCategory", new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _context.Categories.FindAsync(id);
                if (category == null)
                {
                    return NotFound();
                }

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
                await _identityService.ReseedCategoriesAsync();
                await _identityService.ReseedSubCategoriesAsync();
                await InvalidateCategoryDataAsync(id);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }

        private Task InvalidateCategoryDataAsync(int categoryId)
        {
            return _cache.RemoveAsync(
                "categories:all",
                "subcategories:all",
                $"subcategories:category:{categoryId}",
                "expenses:all");
        }
    }
}