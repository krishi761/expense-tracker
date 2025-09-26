using Microsoft.EntityFrameworkCore;
using ExpenseAPI.Models;

namespace ExpenseAPI.Data
{
    public static class DbSeeder
    {
        public static void SeedDatabase(ExpenseDbContext context)
        {
            try
            {
                // Check if database already has data
                if (context.Categories.Any())
                {
                    return; // Database has been seeded
                }

                // Seed Categories
                var categories = new List<Category>
                {
                    new Category { Id = 1, Name = "Food & Dining", Description = "Restaurants, groceries, and food-related expenses" },
                    new Category { Id = 2, Name = "Transportation", Description = "Car, gas, public transport, and travel expenses" },
                    new Category { Id = 3, Name = "Entertainment", Description = "Movies, games, and recreational activities" }
                };

                context.Categories.AddRange(categories);
                context.SaveChanges();

                // Seed SubCategories
                var subCategories = new List<SubCategory>
                {
                    new SubCategory { Id = 1, Name = "Restaurants", Description = "Dining out at restaurants", CategoryId = 1 },
                    new SubCategory { Id = 2, Name = "Groceries", Description = "Food shopping and groceries", CategoryId = 1 },
                    new SubCategory { Id = 3, Name = "Gas", Description = "Fuel for vehicles", CategoryId = 2 },
                    new SubCategory { Id = 4, Name = "Movies", Description = "Cinema and movie tickets", CategoryId = 3 }
                };

                context.SubCategories.AddRange(subCategories);
                context.SaveChanges();

                // Seed Expenses
                var expenses = new List<Expense>
                {
                    new Expense { Id = 1, Name = "Lunch at Pizza Place", Description = "Team lunch meeting", Amount = 45.50m, Date = new DateTime(2024, 1, 15), CategoryId = 1, SubCategoryId = 1 },
                    new Expense { Id = 2, Name = "Weekly Groceries", Description = "Grocery shopping for the week", Amount = 120.75m, Date = new DateTime(2024, 1, 14), CategoryId = 1, SubCategoryId = 2 },
                    new Expense { Id = 3, Name = "Gas Fill-up", Description = "Full tank of gas", Amount = 65.00m, Date = new DateTime(2024, 1, 13), CategoryId = 2, SubCategoryId = 3 }
                };

                context.Expenses.AddRange(expenses);
                context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to seed database: {ex.Message}", ex);
            }
        }
    }
}