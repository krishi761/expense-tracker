import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Expense } from "../models/expense.model";

@Injectable({
  providedIn: "root",
})
export class ExpenseService {
  private apiUrl = "http://localhost:8000/api/expenses";
  private expensesSubject = new BehaviorSubject<Expense[]>([]);

  constructor(private http: HttpClient) {
    this.loadExpenses();
  }

  private loadExpenses(): void {
    this.http.get<Expense[]>(this.apiUrl).subscribe((expenses) => {
      this.expensesSubject.next(expenses);
    });
  }

  getExpenses(): Observable<Expense[]> {
    return this.expensesSubject.asObservable();
  }

  getExpensesWithNames(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  addExpense(expense: Omit<Expense, "id">): Observable<Expense> {
    return this.http
      .post<Expense>(this.apiUrl, expense)
      .pipe(tap(() => this.loadExpenses()));
  }

  updateExpense(id: number, expense: Omit<Expense, "id">): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}`, { ...expense, id })
      .pipe(tap(() => this.loadExpenses()));
  }

  deleteExpense(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadExpenses()));
  }
}
