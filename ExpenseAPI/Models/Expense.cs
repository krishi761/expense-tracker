using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseAPI.Models
{
    public class Expense
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        public DateTime Date { get; set; }
        
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;
        
        public int SubCategoryId { get; set; }
        public virtual SubCategory SubCategory { get; set; } = null!;
    }
}