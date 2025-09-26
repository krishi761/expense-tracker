import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Category } from "../models/category.model";
import { CategoryService } from "../services/category.service";

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Manage Categories</h1>
        <button class="btn btn-primary" (click)="showAddForm()">
          Add Category
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-container" *ngIf="showForm">
        <div class="form-card">
          <h2>{{ isEditing ? "Edit Category" : "Add Category" }}</h2>
          <form (ngSubmit)="onSubmit()" #categoryForm="ngForm">
            <div class="form-group">
              <label for="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="currentCategory.name"
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
                [(ngModel)]="currentCategory.description"
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

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!categoryForm.form.valid"
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

      <!-- Categories Table -->
      <div class="table-container" *ngIf="!showForm">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories">
              <td>{{ category.id }}</td>
              <td>{{ category.name }}</td>
              <td>{{ category.description }}</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-edit"
                  (click)="editCategory(category)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-delete"
                  (click)="confirmDelete(category)"
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
            Are you sure you want to delete the category "{{
              categoryToDelete?.name
            }}"?
          </p>
          <div class="modal-actions">
            <button class="btn btn-danger" (click)="deleteCategory()">
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
        max-width: 1200px;
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

      .header-actions {
        display: flex;
        gap: 10px;
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
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table th {
        background-color: #f8f9fa;
        padding: 15px;
        text-align: left;
        font-weight: 600;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
      }

      .data-table td {
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;
        color: #555;
      }

      .data-table tbody tr:hover {
        background-color: #f8f9fa;
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
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  isEditing = false;
  showDeleteModal = false;
  categoryToDelete: Category | null = null;
  editingCategoryId: number | null = null;

  currentCategory: Partial<Category> = {
    name: "",
    description: "",
  };

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error("Error loading categories:", error);
      },
    });
  }

  showAddForm() {
    this.showForm = true;
    this.isEditing = false;
    this.editingCategoryId = null;
    this.currentCategory = { name: "", description: "" };
  }

  editCategory(category: Category) {
    this.showForm = true;
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.currentCategory = {
      name: category.name,
      description: category.description,
    };
  }

  onSubmit() {
    if (this.isEditing && this.editingCategoryId) {
      this.categoryService
        .updateCategory(
          this.editingCategoryId,
          this.currentCategory as Omit<Category, "id">
        )
        .subscribe({
          next: () => {
            this.loadCategories();
            this.cancelForm();
          },
          error: (error) => {
            console.error("Error updating category:", error);
            alert("Failed to update category. Please try again.");
          },
        });
    } else {
      this.categoryService
        .addCategory(this.currentCategory as Omit<Category, "id">)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.cancelForm();
          },
          error: (error) => {
            console.error("Error adding category:", error);
            alert("Failed to add category. Please try again.");
          },
        });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editingCategoryId = null;
    this.currentCategory = { name: "", description: "" };
  }

  confirmDelete(category: Category) {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  deleteCategory() {
    if (this.categoryToDelete) {
      this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
        next: () => {
          this.loadCategories();
          this.cancelDelete();
        },
        error: (error) => {
          console.error("Error deleting category:", error);
          alert("Failed to delete category. Please try again.");
        },
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }
}
