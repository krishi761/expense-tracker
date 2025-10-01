import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { SubCategory } from "../models/sub-category.model";
import { Category } from "../models/category.model";
import { SubCategoryService } from "../services/sub-category.service";
import { CategoryService } from "../services/category.service";

@Component({
  selector: "app-sub-categories",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ getPageTitle() }}</h1>
        <div class="header-actions" *ngIf="isManageView()">
          <button 
            *ngIf="currentView === 'list'" 
            class="btn btn-primary" 
            (click)="showAddForm()">
            Add Sub-category
          </button>
          <button 
            *ngIf="currentView === 'form'" 
            class="btn btn-secondary" 
            (click)="showListView()">
            Back to List
          </button>
        </div>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-container" *ngIf="currentView === 'form'">
        <div class="form-card">
          <form (ngSubmit)="onSubmit()" #subCategoryForm="ngForm">
            <div class="form-group">
              <label for="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                [(ngModel)]="currentSubCategory.name"
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
                [(ngModel)]="currentSubCategory.description"
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
              <label for="category">Category:</label>
              <select
                id="category"
                name="category"
                [(ngModel)]="currentSubCategory.categoryId"
                required
                class="form-control"
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

            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!subCategoryForm.form.valid"
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

      <!-- Sub-categories Table -->
      <div class="table-container" *ngIf="currentView === 'list'">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th *ngIf="isManageView()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let subCategory of subCategories">
              <td>{{ subCategory.id }}</td>
              <td>{{ subCategory.name }}</td>
              <td>{{ subCategory.description }}</td>
              <td>{{ subCategory.categoryName }}</td>
              <td class="actions" *ngIf="isManageView()">
                <button
                  class="btn btn-sm btn-edit"
                  (click)="editSubCategory(subCategory)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-delete"
                  (click)="confirmDelete(subCategory)"
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
            Are you sure you want to delete the sub-category "{{
              subCategoryToDelete?.name
            }}"?
          </p>
          <div class="modal-actions">
            <button class="btn btn-danger" (click)="deleteSubCategory()">
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

      .page-header h1 {
        color: #333;
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 10px;
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
        .page-container {
          padding-top: 80px; /* Add top padding to prevent nav bar overlap */
        }

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
export class SubCategoriesComponent implements OnInit, OnDestroy {
  subCategories: SubCategory[] = [];
  categories: Category[] = [];
  currentView: 'list' | 'form' = 'list';
  isEditing = false;
  showDeleteModal = false;
  subCategoryToDelete: SubCategory | null = null;
  private routeSubscription: Subscription = new Subscription();

  currentSubCategory: Omit<SubCategory, "id"> & { id?: number } = {
    name: "",
    description: "",
    categoryId: null as any,
  };

  constructor(
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });

    this.subCategoryService
      .getSubCategoriesWithCategoryNames()
      .subscribe((subCategories) => {
        this.subCategories = subCategories;
      });

    this.updateViewBasedOnRoute();
    
    // Subscribe to route changes
    this.routeSubscription = this.router.events.subscribe(() => {
      this.updateViewBasedOnRoute();
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  private updateViewBasedOnRoute() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/manage')) {
      this.currentView = 'list'; // Show list view in manage mode
    } else {
      this.currentView = 'list'; // Show read-only list view
    }
  }

  isManageView(): boolean {
    return this.router.url.includes('/manage');
  }

  getPageTitle(): string {
    if (this.isManageView()) {
      return this.currentView === 'list' ? 'Manage Sub-categories' : (this.isEditing ? 'Edit Sub-category' : 'Add Sub-category');
    } else {
      return 'Sub-categories';
    }
  }

  showAddForm() {
    this.currentView = 'form';
    this.isEditing = false;
    this.currentSubCategory = {
      name: "",
      description: "",
      categoryId: null as any,
    };
  }

  showListView() {
    this.currentView = 'list';
    this.isEditing = false;
    this.currentSubCategory = {
      name: "",
      description: "",
      categoryId: null as any,
    };
  }

  editSubCategory(subCategory: SubCategory) {
    this.currentView = 'form';
    this.isEditing = true;
    this.currentSubCategory = {
      name: subCategory.name,
      description: subCategory.description,
      categoryId: subCategory.categoryId,
    };
    this.currentSubCategory.id = subCategory.id;
  }

  onSubmit() {
    const subCategoryData: Omit<SubCategory, "id"> = {
      name: this.currentSubCategory.name!,
      description: this.currentSubCategory.description!,
      categoryId: Number(this.currentSubCategory.categoryId!),
    };

    if (this.isEditing) {
      this.subCategoryService
        .updateSubCategory(this.currentSubCategory.id!, subCategoryData)
        .subscribe({
          next: () => {
            this.cancelForm();
            this.refreshSubCategories();
          },
          error: (error) => {
            console.error("Error updating subcategory:", error);
            alert("Failed to update subcategory. Please try again.");
          },
        });
    } else {
      this.subCategoryService.addSubCategory(subCategoryData).subscribe({
        next: () => {
          this.cancelForm();
          this.refreshSubCategories();
        },
        error: (error) => {
          console.error("Error adding subcategory:", error);
          let errorMessage = "Failed to add subcategory. Please try again.";
          if (error.error && typeof error.error === "string") {
            errorMessage = error.error;
          } else if (error.error && error.error.title) {
            errorMessage = error.error.title;
          } else if (error.error && error.error.errors) {
            const errors = Object.values(error.error.errors).flat();
            errorMessage = errors.join(", ");
          }
          alert(errorMessage);
        },
      });
    }
  }

  private refreshSubCategories() {
    this.subCategoryService
      .getSubCategoriesWithCategoryNames()
      .subscribe((subCategories) => {
        this.subCategories = subCategories;
      });
  }

  cancelForm() {
    this.currentView = 'list';
    this.isEditing = false;
    this.currentSubCategory = {
      name: "",
      description: "",
      categoryId: null as any,
    };
  }

  confirmDelete(subCategory: SubCategory) {
    this.subCategoryToDelete = subCategory;
    this.showDeleteModal = true;
  }

  deleteSubCategory() {
    if (this.subCategoryToDelete) {
      this.subCategoryService
        .deleteSubCategory(this.subCategoryToDelete.id)
        .subscribe(() => {
          this.cancelDelete();
          this.refreshSubCategories();
        });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.subCategoryToDelete = null;
  }
}
