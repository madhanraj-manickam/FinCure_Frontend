import { Component, EventEmitter, Output, inject, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay } from '../../../../core/Models/TransactionModel';
import { TransactionAggregationService } from '../../../../core/services/transaction-aggregation';


interface ModalCalendarCell {
  date: number;
  fullDate: string;
  isCurrentMonth: boolean;
  data: CalendarDay | null;
}

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() dateSelected = new EventEmitter<string>();

  transactionService = inject(TransactionAggregationService);

  // State
  currentViewDate = signal(new Date());
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthLabel = computed(() => {
    return this.currentViewDate().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  calendarGrid = computed(() => {
    const year = this.currentViewDate().getFullYear();
    const month = this.currentViewDate().getMonth();
    const apiData = this.transactionService.calendarData();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid: ModalCalendarCell[] = [];

    // Empty leading cells
    for (let i = 0; i < firstDay; i++) {
      grid.push({ date: 0, fullDate: '', isCurrentMonth: false, data: null });
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const m = String(month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const fullDate = `${year}-${m}-${d}`;
      
      const dayData = apiData.find(txn => txn.date === fullDate) || null;

      grid.push({ date: day, fullDate, isCurrentMonth: true, data: dayData });
    }

    return grid;
  });

  constructor() {
    // Automatically fetch data when month changes
    effect(() => {
      const year = this.currentViewDate().getFullYear();
      const month = this.currentViewDate().getMonth() + 1;
      this.transactionService.loadCalendar(year, month);
    });
  }

  ngOnInit() {
    // Reset to current date on open
    this.currentViewDate.set(new Date());
  }

  prevMonth() {
    const current = this.currentViewDate();
    this.currentViewDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.currentViewDate();
    this.currentViewDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  onSelectDay(cell: ModalCalendarCell) {
    if (cell.isCurrentMonth) {
      this.dateSelected.emit(cell.fullDate);
      this.close.emit();
    }
  }
}