import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Category } from "../models/category.model";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private apiUrl = "http://localhost:8000/api/categories";
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.http.get<Category[]>(this.apiUrl).subscribe({
      next: (categories) => {
        this.categoriesSubject.next(categories);
      },
      error: (error) => {
        console.error("Failed to load categories:", error);
        console.error("Error details:", error.message, error.status);
        this.categoriesSubject.next([]);
      },
    });
  }

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  addCategory(category: Omit<Category, "id">): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      tap(() => {
        this.loadCategories();
      })
    );
  }

  updateCategory(id: number, category: Omit<Category, "id">): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}`, { ...category, id })
      .pipe(
        tap(() => {
          this.loadCategories();
        })
      );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loadCategories();
      })
    );
  }

  // Helper method for other services
  getCategoryByIdSync(id: number): Category | undefined {
    const categories = this.categoriesSubject.value;
    return categories.find((cat) => cat.id === id);
  }
}
