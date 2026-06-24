import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateContextService, PeriodType } from '../../../../core/services/date-context';


@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="period-control-bar">
      <div class="period-tabs">
        <button *ngFor="let p of periods" 
                class="tab-btn" 
                [class.active]="context.currentContext().period === p.value"
                (click)="setPeriod(p.value)">
          {{ p.label }}
        </button>
      </div>
      
      <div class="current-label-badge">
        <span class="icon">📅</span>
        <span class="label-text">{{ context.currentContext().label }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./period-selector.css']
})
export class PeriodSelectorComponent {
  context = inject(DateContextService);

  periods: { label: string, value: PeriodType }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
    // Note: Custom date picker logic would go here in a full implementation
  ];

  setPeriod(period: PeriodType) {
    const now = new Date();
    let start: Date, end: Date, label: string;

    switch(period) {
      case 'daily':
       start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        label = 'Today';
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        label = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        label = now.getFullYear().toString();
        break;
      default: // default to monthly logic for brevity
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        label = 'Current Month';
    }

    this.context.setContext(period, start, end, label);
  }
}