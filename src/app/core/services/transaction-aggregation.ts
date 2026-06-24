import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PeriodSummary, CalendarDay } from '../Models/TransactionModel';

@Injectable({ providedIn: 'root' })
export class TransactionAggregationService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5028/api/Transaction';

  // Signals to hold the fetched data so components can just read them
  summaryData = signal<PeriodSummary | null>(null);
  calendarData = signal<CalendarDay[]>([]);
  isLoading = signal<boolean>(false);

  loadSummary(startDate: string, endDate: string, period: string) {
    this.isLoading.set(true);
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('period', period);

    this.http.get<PeriodSummary>(`${this.apiUrl}/summary`, { params }).subscribe({
      next: (data) => {
        this.summaryData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load summary', err);
        this.isLoading.set(false);
      }
    });
  }

  loadCalendar(year: number, month: number) {
    let params = new HttpParams().set('year', year).set('month', month);
    this.http.get<CalendarDay[]>(`${this.apiUrl}/calendar`, { params }).subscribe({
      next: (data) => this.calendarData.set(data),
      error: (err) => console.error('Failed to load calendar', err)
    });
  }
}