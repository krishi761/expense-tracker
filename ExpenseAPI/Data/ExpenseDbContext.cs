using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Models;

namespace ExpenseAPI.Data
{
    public class ExpenseDbContext : DbContext
    {
        public ExpenseDbContext(DbContextOptions<ExpenseDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Expense> Expenses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<SubCategory>()
                .HasOne(sc => sc.Category)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(sc => sc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Category)
                .WithMany(c => c.Expenses)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.SubCategory)
                .WithMany(sc => sc.Expenses)
                .HasForeignKey(e => e.SubCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Note: Seed data moved to SeedData method for persistent database compatibility
        }

        public void SeedData()
        {
            try
            {
                // Check if data already exists to prevent duplicates
                if (Categories.Any())
                {
                    return; // Database has been seeded
                }

                // Seed Categories
                var categories = new[]
                {
                    new Category { Name = "Food & Dining", Description = "Restaurants, groceries, and food-related expenses" },
                    new Category { Name = "Transportation", Description = "Car, gas, public transport, and travel expenses" },
                    new Category { Name = "Entertainment", Description = "Movies, games, and recreational activities" }
                };

                Categories.AddRange(categories);
                SaveChanges();

                // Seed SubCategories
                var subCategories = new[]
                {
                    new SubCategory { Name = "Restaurants", Description = "Dining out at restaurants", CategoryId = categories[0].Id },
                    new SubCategory { Name = "Groceries", Description = "Food shopping and groceries", CategoryId = categories[0].Id },
                    new SubCategory { Name = "Gas", Description = "Fuel for vehicles", CategoryId = categories[1].Id },
                    new SubCategory { Name = "Movies", Description = "Cinema and movie tickets", CategoryId = categories[2].Id }
                };

                SubCategories.AddRange(subCategories);
                SaveChanges();

                // Seed Expenses
                var expenses = new[]
                {
                    new Expense { Name = "Lunch at Pizza Place", Description = "Team lunch meeting", Amount = 45.50m, Date = new DateTime(2024, 1, 15), CategoryId = categories[0].Id, SubCategoryId = subCategories[0].Id },
                    new Expense { Name = "Weekly Groceries", Description = "Grocery shopping for the week", Amount = 120.75m, Date = new DateTime(2024, 1, 14), CategoryId = categories[0].Id, SubCategoryId = subCategories[1].Id },
                    new Expense { Name = "Gas Fill-up", Description = "Full tank of gas", Amount = 65.00m, Date = new DateTime(2024, 1, 13), CategoryId = categories[1].Id, SubCategoryId = subCategories[2].Id }
                };

                Expenses.AddRange(expenses);
                SaveChanges();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to seed database: {ex.Message}", ex);
            }
        }
    }
}