using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseAPI.Migrations
{
    /// <inheritdoc />
    public partial class EnforceExpenseSubCategoryCategoryMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_SubCategories_SubCategoryId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_SubCategoryId",
                table: "Expenses");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_SubCategories_Id_CategoryId",
                table: "SubCategories",
                columns: new[] { "Id", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_SubCategoryId_CategoryId",
                table: "Expenses",
                columns: new[] { "SubCategoryId", "CategoryId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_SubCategories_SubCategoryId_CategoryId",
                table: "Expenses",
                columns: new[] { "SubCategoryId", "CategoryId" },
                principalTable: "SubCategories",
                principalColumns: new[] { "Id", "CategoryId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_SubCategories_SubCategoryId_CategoryId",
                table: "Expenses");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_SubCategories_Id_CategoryId",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_SubCategoryId_CategoryId",
                table: "Expenses");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_SubCategoryId",
                table: "Expenses",
                column: "SubCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_SubCategories_SubCategoryId",
                table: "Expenses",
                column: "SubCategoryId",
                principalTable: "SubCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
