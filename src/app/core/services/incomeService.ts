import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Income {
  id: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface IncomeCreate {
  amount: number;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  
  // Note: The AuthInterceptor we built earlier will automatically attach the JWT token to these requests.
  private readonly apiUrl = 'http://localhost:5028/api/Income';

  // Signal state management
  incomes = signal<Income[]>([]);
  isLoading = signal<boolean>(false);

  loadIncomes(): void {
    this.isLoading.set(true);
    this.http.get<Income[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.incomes.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load incomes', err);
        this.isLoading.set(false);
      }
    });
  }

  addIncome(income: IncomeCreate): Observable<Income> {
    return this.http.post<Income>(this.apiUrl, income).pipe(
      tap((newIncome) => {
        // Unshift adds the new item to the top of the signal array instantly
        this.incomes.update(current => [newIncome, ...current]);
      })
    );
  }

  deleteIncome(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Filter out the deleted item from the signal array instantly
        this.incomes.update(current => current.filter(i => i.id !== id));
      })
    );
  }
}