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
                if (context.Categories.Any())
                {
                    return;
                }
  
                var categories = new List<Category>
                {
                    new Category { Name = "Food & Dining", Description = "Restaurants, groceries, and food-related expenses" },
                    new Category { Name = "Transportation", Description = "Car, gas, public transport, and travel expenses" },
                    new Category { Name = "Entertainment", Description = "Movies, games, and recreational activities" }
                };

                context.Categories.AddRange(categories);
                context.SaveChanges();

                var subCategories = new List<SubCategory>
                {
                    new SubCategory { Name = "Restaurants", Description = "Dining out at restaurants", CategoryId = categories[0].Id },
                    new SubCategory { Name = "Groceries", Description = "Food shopping and groceries", CategoryId = categories[0].Id },
                    new SubCategory { Name = "Gas", Description = "Fuel for vehicles", CategoryId = categories[1].Id },
                    new SubCategory { Name = "Movies", Description = "Cinema and movie tickets", CategoryId = categories[2].Id }
                };

                context.SubCategories.AddRange(subCategories);
                context.SaveChanges();

                var expenses = new List<Expense>
                {
                    new Expense { Name = "Lunch at Pizza Place", Description = "Team lunch meeting", Amount = 45.50m, Date = new DateTime(2024, 1, 15), CategoryId = categories[0].Id, SubCategoryId = subCategories[0].Id },
                    new Expense { Name = "Weekly Groceries", Description = "Grocery shopping for the week", Amount = 120.75m, Date = new DateTime(2024, 1, 14), CategoryId = categories[0].Id, SubCategoryId = subCategories[1].Id },
                    new Expense { Name = "Gas Fill-up", Description = "Full tank of gas", Amount = 65.00m, Date = new DateTime(2024, 1, 13), CategoryId = categories[1].Id, SubCategoryId = subCategories[2].Id }
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