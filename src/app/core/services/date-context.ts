import { Injectable, signal, computed } from '@angular/core';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  period: PeriodType;
  label: string;     // e.g., "June 2026" or "This Week"
}

@Injectable({ providedIn: 'root' })
export class DateContextService {
  
  // The global state signal. Defaults to the current month.
  currentContext = signal<DateRange>(this.getDefaultMonthContext());

  // A computed signal specifically for the Calendar view
  currentCalendarMonth = computed(() => {
    const start = new Date(this.currentContext().startDate);
    return { year: start.getFullYear(), month: start.getMonth() + 1 };
  });

  // Forces the date to remain in your local timezone, completely ignoring UTC shifts.
  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Action to change the period
  setContext(period: PeriodType, start: Date, end: Date, label: string) {
    this.currentContext.set({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      period: period,
      label: label
    });
  }

  // Helper to initialize the app with "This Month"
  private getDefaultMonthContext(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      period: 'monthly',
      label: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  }
}