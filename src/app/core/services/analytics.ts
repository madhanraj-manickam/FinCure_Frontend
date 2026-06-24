import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CategoryAnalytics, TrendAnalytics } from '../Models/AnalyticsModel';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5028/api/Analytics';

  // State signals
  incomeCategories = signal<CategoryAnalytics[]>([]);
  expenseCategories = signal<CategoryAnalytics[]>([]);
  monthlyTrend = signal<TrendAnalytics[]>([]);

  loadCategoryBreakdown(type: 'Income' | 'Expense', startDate: string, endDate: string) {
    let params = new HttpParams()
      .set('type', type)
      .set('startDate', startDate)
      .set('endDate', endDate);

    this.http.get<CategoryAnalytics[]>(`${this.apiUrl}/category`, { params }).subscribe(data => {
      if (type === 'Income') this.incomeCategories.set(data);
      else this.expenseCategories.set(data);
    });
  }

  loadMonthlyTrend(startDate: string, endDate: string) {
    let params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    this.http.get<TrendAnalytics[]>(`${this.apiUrl}/trend/monthly`, { params }).subscribe(data => {
      this.monthlyTrend.set(data);
    });
  }
}