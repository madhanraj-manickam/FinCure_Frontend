import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Investment {
  investmentId: number;
  investmentName: string;
  investmentType: string;
  amountInvested: number;
  startDate: string;
  notes?: string;
}

export interface CreateInvestment {
  investmentName: string;
  investmentType: string;
  amountInvested: number;
  startDate: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5028/api/Investment';

  // State management
  investments = signal<Investment[]>([]);
  isLoading = signal<boolean>(false);

  // Instantly calculates total portfolio value without needing an extra API call
  totalPortfolioValue = computed(() => {
    return this.investments().reduce((sum, item) => sum + item.amountInvested, 0);
  });

  loadInvestments(): void {
    this.isLoading.set(true);
    this.http.get<Investment[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.investments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load investments', err);
        this.isLoading.set(false);
      }
    });
  }

  addInvestment(investment: CreateInvestment): Observable<Investment> {
    return this.http.post<Investment>(this.apiUrl, investment).pipe(
      tap((newInvestment) => {
        this.investments.update(current => [newInvestment, ...current]);
      })
    );
  }

  deleteInvestment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.investments.update(current => current.filter(i => i.investmentId !== id));
      })
    );
  }
}