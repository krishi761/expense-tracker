import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { SubCategory } from "../models/sub-category.model";

@Injectable({
  providedIn: "root",
})
export class SubCategoryService {
  private apiUrl = "http://localhost:8000/api/subcategories";
  private subCategoriesSubject = new BehaviorSubject<SubCategory[]>([]);

  constructor(private http: HttpClient) {
    this.loadSubCategories();
  }

  private loadSubCategories(): void {
    this.http.get<SubCategory[]>(this.apiUrl).subscribe({
      next: (subCategories) => {
        this.subCategoriesSubject.next(subCategories);
      },
      error: (error) => {
        console.error("Failed to load subcategories:", error);
        console.error("Error details:", error.message, error.status);
        this.subCategoriesSubject.next([]);
      },
    });
  }

  getSubCategories(): Observable<SubCategory[]> {
    return this.subCategoriesSubject.asObservable();
  }

  getSubCategoriesWithCategoryNames(): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(this.apiUrl);
  }

  getSubCategoryById(id: number): Observable<SubCategory> {
    return this.http.get<SubCategory>(`${this.apiUrl}/${id}`);
  }

  getSubCategoriesByCategory(categoryId: number): Observable<SubCategory[]> {
    return this.http.get<SubCategory[]>(
      `${this.apiUrl}/ByCategory/${categoryId}`
    );
  }

  addSubCategory(
    subCategory: Omit<SubCategory, "id">
  ): Observable<SubCategory> {
    return this.http.post<SubCategory>(this.apiUrl, subCategory).pipe(
      tap(() => {
        this.loadSubCategories();
      })
    );
  }

  updateSubCategory(
    id: number,
    subCategory: Omit<SubCategory, "id">
  ): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}`, { ...subCategory, id })
      .pipe(
        tap(() => {
          this.loadSubCategories();
        })
      );
  }

  deleteSubCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loadSubCategories();
      })
    );
  }

  // Helper method for other services
  getSubCategoryByIdSync(id: number): SubCategory | undefined {
    const subCategories = this.subCategoriesSubject.value;
    return subCategories.find((subCat) => subCat.id === id);
  }
}
