using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.DTOs
{
    public class CreateExpenseDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public int CategoryId { get; set; }
        
        [Required]
        public int SubCategoryId { get; set; }
    }
}