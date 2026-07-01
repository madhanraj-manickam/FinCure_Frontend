import { Injectable, signal, computed } from '@angular/core';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateRange {
  startDate: string; 
  endDate: string;   
  period: PeriodType;
  label: string;     
  anchorDate: Date;  // THE NEW SINGLE SOURCE OF TRUTH
}

@Injectable({ providedIn: 'root' })
export class DateContextService {
  
  // Initialize with today's date
  currentContext = signal<DateRange>(this.calculateRange(new Date(), 'monthly'));

  currentCalendarMonth = computed(() => {
    const anchor = this.currentContext().anchorDate;
    return { year: anchor.getFullYear(), month: anchor.getMonth() + 1 };
  });

  // Action 1: User switches the Tab (Daily, Weekly, etc.)
  // We keep the existing anchor date, just change the math around it!
  setPeriod(period: PeriodType) {
    const currentAnchor = this.currentContext().anchorDate;
    this.currentContext.set(this.calculateRange(currentAnchor, period));
  }

  // Action 2: User clicks a specific day in the Calendar
  // We set a new anchor date and switch to 'daily' view
  setAnchorDate(dateString: string) {
    // Append T00:00:00 to prevent timezone shifting when parsing the string
    const newAnchor = new Date(`${dateString}T00:00:00`);
    this.currentContext.set(this.calculateRange(newAnchor, 'daily'));
  }

  // THE ENGINE: Calculates all boundaries based strictly on the Anchor Date
  private calculateRange(anchor: Date, period: PeriodType): DateRange {
    let start: Date, end: Date, label: string;

    switch(period) {
      case 'daily':
        start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
        end = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
        label = anchor.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' }); // e.g., "June 15, 2026"
        break;

      case 'weekly':
        // Find the Sunday of the week containing the anchor date
        const dayOfWeek = anchor.getDay(); 
        const diff = anchor.getDate() - dayOfWeek;
        start = new Date(anchor.getFullYear(), anchor.getMonth(), diff);
        end = new Date(anchor.getFullYear(), anchor.getMonth(), diff + 6);
        
        // e.g., "Jun 14 - Jun 20, 2026"
        const startStr = start.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
        label = `${startStr} - ${endStr}`;
        break;

      case 'monthly':
        start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
        label = anchor.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g., "June 2026"
        break;

      case 'yearly':
        start = new Date(anchor.getFullYear(), 0, 1);
        end = new Date(anchor.getFullYear(), 11, 31);
        label = anchor.getFullYear().toString(); // e.g., "2026"
        break;

      default:
        start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
        label = 'Current Month';
    }

    return {
      startDate: this.formatLocalDate(start),
      endDate: this.formatLocalDate(end),
      period: period,
      label: label,
      anchorDate: anchor
    };
  }

  // Prevents UTC shift bugs when sending dates to C#
  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}