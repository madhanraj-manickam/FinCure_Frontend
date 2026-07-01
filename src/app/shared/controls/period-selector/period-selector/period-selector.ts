import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarModalComponent } from '../../calendar/calendar/calendar';
import { DateContextService, PeriodType } from '../../../../core/services/date-context';


@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [CommonModule, CalendarModalComponent],
  template: `
    <div class="period-control-bar">
      <div class="period-tabs">
        <button *ngFor="let p of periods" 
                class="tab-btn" 
                [class.active]="context.currentContext().period === p.value"
                (click)="onTabClick(p.value)">
          {{ p.label }}
        </button>
      </div>
      
      <div class="current-label-badge interactive-badge" (click)="isModalOpen = true">
        <span class="icon">📅</span>
        <span class="label-text">{{ context.currentContext().label }}</span>
      </div>
    </div>

    <app-calendar-modal 
      *ngIf="isModalOpen" 
      (close)="isModalOpen = false"
      (dateSelected)="handleDateSelection($event)">
    </app-calendar-modal>
  `,
  styleUrls: ['./period-selector.css'] // Make sure to keep your existing CSS
})
export class PeriodSelectorComponent implements OnInit {
  context = inject(DateContextService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isModalOpen = false;

  periods: { label: string, value: PeriodType }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  ngOnInit() {
    // Optional: Sync URL parameters on load
    this.route.queryParams.subscribe(params => {
      const urlPeriod = params['period'] as PeriodType;
      if (urlPeriod && this.periods.some(p => p.value === urlPeriod)) {
        this.context.setPeriod(urlPeriod);
      }
    });
  }

  onTabClick(period: PeriodType) {
    // Change the period (keeps the global anchor date)
    this.context.setPeriod(period);
    
    // Update the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period: period },
      queryParamsHandling: 'merge' 
    });
  }

  handleDateSelection(selectedDate: string) {
    // Update the global anchor to the clicked date
    this.context.setAnchorDate(selectedDate);
    
    // Update the URL to daily
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period: 'daily' },
      queryParamsHandling: 'merge' 
    });
  }
}