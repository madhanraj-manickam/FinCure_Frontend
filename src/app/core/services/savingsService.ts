import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SavingsSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class SavingsService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5028/api/Savings/savings';

  // State management
  summary = signal<SavingsSummary | null>(null);
  isLoading = signal<boolean>(false);

  loadSummary(): void {
    this.isLoading.set(true);
    this.http.get<SavingsSummary>(this.apiUrl).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load savings summary', err);
        this.isLoading.set(false);
      }
    });
  }
}