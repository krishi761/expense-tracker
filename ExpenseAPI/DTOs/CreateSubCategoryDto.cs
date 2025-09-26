using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.DTOs
{
    public class CreateSubCategoryDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public int CategoryId { get; set; }
    }
}