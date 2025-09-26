using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ExpenseAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeedDataFromModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Expenses",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Expenses",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Expenses",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "SubCategories",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "SubCategories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "SubCategories",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "SubCategories",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Restaurants, groceries, and food-related expenses", "Food & Dining" },
                    { 2, "Car, gas, public transport, and travel expenses", "Transportation" },
                    { 3, "Movies, games, and recreational activities", "Entertainment" }
                });

            migrationBuilder.InsertData(
                table: "SubCategories",
                columns: new[] { "Id", "CategoryId", "Description", "Name" },
                values: new object[,]
                {
                    { 1, 1, "Dining out at restaurants", "Restaurants" },
                    { 2, 1, "Food shopping and groceries", "Groceries" },
                    { 3, 2, "Fuel for vehicles", "Gas" },
                    { 4, 3, "Cinema and movie tickets", "Movies" }
                });

            migrationBuilder.InsertData(
                table: "Expenses",
                columns: new[] { "Id", "Amount", "CategoryId", "Date", "Description", "Name", "SubCategoryId" },
                values: new object[,]
                {
                    { 1, 45.50m, 1, new DateTime(2024, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Team lunch meeting", "Lunch at Pizza Place", 1 },
                    { 2, 120.75m, 1, new DateTime(2024, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "Grocery shopping for the week", "Weekly Groceries", 2 },
                    { 3, 65.00m, 2, new DateTime(2024, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), "Full tank of gas", "Gas Fill-up", 3 }
                });
        }
    }
}
