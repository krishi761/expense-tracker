using System.ComponentModel.DataAnnotations;

namespace ExpenseAPI.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}