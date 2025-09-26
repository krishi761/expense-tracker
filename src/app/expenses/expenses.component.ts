import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Expense } from "../models/expense.model";
import { Category } from "../models/category.model";
import { SubCategory } from "../models/sub-category.model";
import { ExpenseService } from "../services/expense.service";
import { CategoryService } from "../services/category.service";
import { SubCategoryService } from "../services/sub-category.service";

@Component({
  selector: "app-expenses",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Manage Expenses</h1>
        <button class="btn btn-primary" (click)="showAddForm()">
          Add Expense
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-container" *ngIf="showForm">
        <div class="form-card">
          <h2>{{ isEditing ? "Edit Expense" : "Add Expense" }}</h2>
          <form (ngSubmit)="onSubmit()" #expenseForm="ngForm">
            <div class="form-group">
              <label for="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="currentExpense.name"
                required
                class="form-control"
                #nameField="ngModel"
              />
              <div
                class="error-message"
                *ngIf="nameField.invalid && nameField.touched"
              >
                Name is required
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description:</label>
              <textarea
                id="description"
                name="description"
                [(ngModel)]="currentExpense.description"
                required
                class="form-control"
                rows="3"
                #descField="ngModel"
              ></textarea>
              <div
                class="error-message"
                *ngIf="descField.invalid && descField.touched"
              >
                Description is required
              </div>
            </div>

            <div class="form-group">
              <label for="amount">Amount (₹):</label>
              <div class="input-group">
                <span class="input-prefix">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  [(ngModel)]="currentExpense.amount"
                  required
                  min="0"
                  step="0.01"
                  class="form-control amount-input"
                  #amountField="ngModel"
                  placeholder="Enter amount in rupees"
                />
              </div>
              <div
                class="error-message"
                *ngIf="amountField.invalid && amountField.touched"
              >
                Amount is required and must be greater than 0
              </div>
            </div>

            <div class="form-group">
              <label for="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                [(ngModel)]="currentExpenseDate"
                required
                class="form-control"
                #dateField="ngModel"
              />
              <div
                class="error-message"
                *ngIf="dateField.invalid && dateField.touched"
              >
                Date is required
              </div>
            </div>

            <div class="form-group">
              <label for="category">Category:</label>
              <select
                id="category"
                name="category"
                [(ngModel)]="currentExpense.categoryId"
                required
                class="form-control"
                (change)="onCategoryChange()"
                #categoryField="ngModel"
              >
                <option value="">Select a category</option>
                <option
                  *ngFor="let category of categories"
                  [value]="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <div
                class="error-message"
                *ngIf="categoryField.invalid && categoryField.touched"
              >
                Category is required
              </div>
            </div>

            <div class="form-group">
              <label for="subCategory">Sub-category:</label>
              <select
                id="subCategory"
                name="subCategory"
                [(ngModel)]="currentExpense.subCategoryId"
                required
                class="form-control"
                [disabled]="!currentExpense.categoryId"
                #subCategoryField="ngModel"
              >
                <option value="">Select a sub-category</option>
                <option
                  *ngFor="let subCategory of filteredSubCategories"
                  [value]="subCategory.id"
                >
                  {{ subCategory.name }}
                </option>
              </select>
              <div
                class="error-message"
                *ngIf="subCategoryField.invalid && subCategoryField.touched"
              >
                Sub-category is required
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!expenseForm.form.valid"
              >
                {{ isEditing ? "Update" : "Submit" }}
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                (click)="cancelForm()"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Expenses Table -->
      <div class="table-container" *ngIf="!showForm">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Category</th>
              <th>Sub-category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let expense of expenses">
              <td>{{ expense.id }}</td>
              <td>{{ expense.name }}</td>
              <td>{{ expense.description }}</td>
              <td class="amount">₹{{ expense.amount | number : "1.2-2" }}</td>
              <td>{{ expense.date | date : "dd/MM/yyyy" }}</td>
              <td>{{ expense.categoryName }}</td>
              <td>{{ expense.subCategoryName }}</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-edit"
                  (click)="editExpense(expense)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-delete"
                  (click)="confirmDelete(expense)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        class="modal-overlay"
        *ngIf="showDeleteModal"
        (click)="cancelDelete()"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Confirm Delete</h3>
          <p>
            Are you sure you want to delete the expense "{{
              expenseToDelete?.name
            }}"?
          </p>
          <div class="modal-actions">
            <button class="btn btn-danger" (click)="deleteExpense()">
              Delete
            </button>
            <button class="btn btn-secondary" (click)="cancelDelete()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e0e0e0;
      }

      .page-header h1 {
        color: #333;
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        text-align: center;
      }

      .btn-primary {
        background-color: #3498db;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #2980b9;
        transform: translateY(-1px);
      }

      .btn-secondary {
        background-color: #95a5a6;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #7f8c8d;
      }

      .btn-edit {
        background-color: #f39c12;
        color: white;
      }

      .btn-edit:hover {
        background-color: #e67e22;
      }

      .btn-delete {
        background-color: #e74c3c;
        color: white;
      }

      .btn-delete:hover {
        background-color: #c0392b;
      }

      .btn-danger {
        background-color: #e74c3c;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c0392b;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
        margin-right: 5px;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .form-container {
        margin-bottom: 30px;
      }

      .form-card {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }

      .form-card h2 {
        margin-bottom: 25px;
        color: #333;
        font-size: 24px;
        font-weight: 600;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
      }

      .form-control {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s ease;
      }

      .form-control:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }

      .form-control.ng-invalid.ng-touched {
        border-color: #e74c3c;
      }

      .form-control:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
      }

      .input-group {
        display: flex;
        align-items: center;
      }

      .input-prefix {
        background-color: #f8f9fa;
        border: 2px solid #e0e0e0;
        border-right: none;
        padding: 12px 15px;
        border-radius: 6px 0 0 6px;
        font-weight: 600;
        color: #666;
        font-size: 16px;
      }

      .amount-input {
        border-radius: 0 6px 6px 0 !important;
        border-left: none !important;
      }

      .amount-input:focus + .input-prefix,
      .input-prefix:has(+ .amount-input:focus) {
        border-color: #3498db;
      }

      .error-message {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
      }

      .form-actions {
        display: flex;
        gap: 15px;
        margin-top: 25px;
      }

      .table-container {
        background: white;
        border-radius: 8px;
        overflow-x: auto;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 800px;
      }

      .data-table th {
        background-color: #f8f9fa;
        padding: 15px;
        text-align: left;
        font-weight: 600;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
        white-space: nowrap;
      }

      .data-table td {
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
        color: #555;
      }

      .data-table tbody tr:hover {
        background-color: #f8f9fa;
      }

      .amount {
        font-weight: 600;
        color: #27ae60;
        font-size: 16px;
        text-align: right;
      }

      .actions {
        white-space: nowrap;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
      }

      .modal-content h3 {
        margin-bottom: 15px;
        color: #333;
      }

      .modal-content p {
        margin-bottom: 25px;
        color: #666;
      }

      .modal-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
      }

      @media (max-width: 768px) {
        .page-header {
          flex-direction: column;
          gap: 15px;
          align-items: stretch;
        }

        .form-actions {
          flex-direction: column;
        }

        .data-table {
          font-size: 14px;
        }

        .data-table th,
        .data-table td {
          padding: 10px 8px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .btn-sm {
          margin-right: 0;
        }
      }
    `,
  ],
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  filteredSubCategories: SubCategory[] = [];
  showForm = false;
  isEditing = false;
  showDeleteModal = false;
  expenseToDelete: Expense | null = null;
  currentExpenseDate = "";

  currentExpense: Partial<Expense> = {
    name: "",
    description: "",
    amount: 0,
    date: new Date(),
    categoryId: 0,
    subCategoryId: 0,
  };

  constructor(
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private subCategoryService: SubCategoryService
  ) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

    this.subCategoryService.getSubCategories().subscribe((subCategories) => {
      this.subCategories = subCategories;
    });

    this.expenseService.getExpensesWithNames().subscribe((expenses) => {
      this.expenses = expenses;
    });
  }

  showAddForm() {
    this.showForm = true;
    this.isEditing = false;
    this.currentExpense = {
      name: "",
      description: "",
      amount: 0,
      date: new Date(),
      categoryId: 0,
      subCategoryId: 0,
    };
    this.currentExpenseDate = new Date().toISOString().split("T")[0];
    this.filteredSubCategories = [];
  }

  editExpense(expense: Expense) {
    this.showForm = true;
    this.isEditing = true;
    this.currentExpense = {
      name: expense.name,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      categoryId: expense.categoryId,
      subCategoryId: expense.subCategoryId,
    };
    this.currentExpense.id = expense.id;
    this.currentExpenseDate = new Date(expense.date)
      .toISOString()
      .split("T")[0];
    this.onCategoryChange();
  }

  onCategoryChange() {
    if (this.currentExpense.categoryId) {
      this.subCategoryService
        .getSubCategoriesByCategory(Number(this.currentExpense.categoryId))
        .subscribe((subCategories) => {
          this.filteredSubCategories = subCategories;
          // Reset sub-category selection if it doesn't belong to the selected category
          if (this.currentExpense.subCategoryId) {
            const isValidSubCategory = this.filteredSubCategories.some(
              (subCat) =>
                subCat.id === Number(this.currentExpense.subCategoryId)
            );
            if (!isValidSubCategory) {
              this.currentExpense.subCategoryId = 0;
            }
          }
        });
    } else {
      this.filteredSubCategories = [];
      this.currentExpense.subCategoryId = 0;
    }
  }

  onSubmit() {
    // Convert the date string back to Date object
    this.currentExpense.date = new Date(this.currentExpenseDate);

    if (this.isEditing) {
      this.expenseService
        .updateExpense(
          this.currentExpense.id!,
          this.currentExpense as Omit<Expense, "id">
        )
        .subscribe(() => {
          this.cancelForm();
          this.refreshExpenses();
        });
    } else {
      this.expenseService
        .addExpense(this.currentExpense as Omit<Expense, "id">)
        .subscribe(() => {
          this.cancelForm();
          this.refreshExpenses();
        });
    }
  }

  private refreshExpenses() {
    this.expenseService.getExpensesWithNames().subscribe((expenses) => {
      this.expenses = expenses;
    });
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.currentExpense = {
      name: "",
      description: "",
      amount: 0,
      date: new Date(),
      categoryId: 0,
      subCategoryId: 0,
    };
    this.currentExpenseDate = "";
    this.filteredSubCategories = [];
  }

  confirmDelete(expense: Expense) {
    this.expenseToDelete = expense;
    this.showDeleteModal = true;
  }

  deleteExpense() {
    if (this.expenseToDelete) {
      this.expenseService
        .deleteExpense(this.expenseToDelete.id)
        .subscribe(() => {
          this.cancelDelete();
          this.refreshExpenses();
        });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.expenseToDelete = null;
  }
}
