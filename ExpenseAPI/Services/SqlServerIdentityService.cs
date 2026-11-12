using ExpenseAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace ExpenseAPI.Services
{
    public class SqlServerIdentityService
    {
        private readonly ExpenseDbContext _context;

        public SqlServerIdentityService(ExpenseDbContext context)
        {
            _context = context;
        }

        public async Task ReseedAllAsync(CancellationToken cancellationToken = default)
        {
            await ReseedCategoriesAsync(cancellationToken);
            await ReseedSubCategoriesAsync(cancellationToken);
            await ReseedExpensesAsync(cancellationToken);
        }

        public async Task ReseedCategoriesAsync(CancellationToken cancellationToken = default)
        {
            var maxId = await _context.Categories
                .Select(category => (int?)category.Id)
                .MaxAsync(cancellationToken) ?? 0;
            await ReseedAsync("Categories", maxId, cancellationToken);
        }

        public async Task ReseedSubCategoriesAsync(CancellationToken cancellationToken = default)
        {
            var maxId = await _context.SubCategories
                .Select(subCategory => (int?)subCategory.Id)
                .MaxAsync(cancellationToken) ?? 0;
            await ReseedAsync("SubCategories", maxId, cancellationToken);
        }

        public async Task ReseedExpensesAsync(CancellationToken cancellationToken = default)
        {
            var maxId = await _context.Expenses
                .Select(expense => (int?)expense.Id)
                .MaxAsync(cancellationToken) ?? 0;
            await ReseedAsync("Expenses", maxId, cancellationToken);
        }

        private Task<int> ReseedAsync(
            string tableName,
            int maxId,
            CancellationToken cancellationToken)
        {
            FormattableString command = tableName switch
            {
                "Categories" => $"DBCC CHECKIDENT ('dbo.Categories', RESEED, {maxId})",
                "SubCategories" => $"DBCC CHECKIDENT ('dbo.SubCategories', RESEED, {maxId})",
                "Expenses" => $"DBCC CHECKIDENT ('dbo.Expenses', RESEED, {maxId})",
                _ => throw new ArgumentOutOfRangeException(nameof(tableName))
            };

            return _context.Database.ExecuteSqlInterpolatedAsync(command, cancellationToken);
        }
    }
}
