import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface ExpenseCreate {
  amount: number;
  category: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5028/api/Expense';

  // Signal state management
  expenses = signal<Expense[]>([]);
  isLoading = signal<boolean>(false);

  loadExpenses(): void {
    this.isLoading.set(true);
    this.http.get<Expense[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.expenses.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load expenses', err);
        this.isLoading.set(false);
      }
    });
  }

  addExpense(expense: ExpenseCreate): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense).pipe(
      tap((newExpense) => {
        // Instantly update the UI by adding the new record to the top of the array
        this.expenses.update(current => [newExpense, ...current]);
      })
    );
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Instantly remove the record from the UI
        this.expenses.update(current => current.filter(e => e.id !== id));
      })
    );
  }
}