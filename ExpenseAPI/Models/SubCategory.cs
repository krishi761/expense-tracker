using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.Models
{
    public class SubCategory
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public int CategoryId { get; set; }
        public virtual Category Category { get; set; } = null!;
        
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}