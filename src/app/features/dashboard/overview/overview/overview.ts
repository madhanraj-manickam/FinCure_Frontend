// import { Component, inject, OnInit, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { SavingsService } from '../../../../core/services/savingsService';
// import { IncomeService } from '../../../../core/services/incomeService';
// import { ExpenseService } from '../../../../core/services/expenseService';


// @Component({
//   selector: 'app-overview',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './overview.html',
//   styleUrls: ['./overview.css']
// })
// export class Overview implements OnInit {
//   savingsService = inject(SavingsService);
//   private incomeService = inject(IncomeService);
//   private expenseService = inject(ExpenseService);

//   // A computed signal that intelligently merges and sorts incomes and expenses 
//   // to create a unified "Recent Activity" feed for the dashboard.
//   recentActivity = computed(() => {
//     const incomes = this.incomeService.incomes().map(i => ({ 
//       ...i, 
//       type: 'income',
//       title: 'Income Added'
//     }));
    
//     const expenses = this.expenseService.expenses().map(e => ({ 
//       ...e, 
//       type: 'expense',
//       title: 'Expense Recorded'
//     }));

//     // Combine, sort by date descending, and take the 5 most recent
//     const combined = [...incomes, ...expenses].sort((a, b) => 
//       new Date(b.date).getTime() - new Date(a.date).getTime()
//     );

//     return combined.slice(0, 5);
//   });

//   ngOnInit() {
//     // Load the summary metrics
//     this.savingsService.loadSummary();
    
//     // Load the underlying data for the recent activity feed
//     // (Only triggers the API call if the arrays are currently empty to save bandwidth)
//     if (this.incomeService.incomes().length === 0) {
//       this.incomeService.loadIncomes();
//     }
//     if (this.expenseService.expenses().length === 0) {
//       this.expenseService.loadExpenses();
//     }
//   }
// }

import { Component, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Import the new Aggregation and Context Services



// Import the Period Selector UI Component
import { DateContextService } from '../../../../core/services/date-context';
import { TransactionAggregationService } from '../../../../core/services/transaction-aggregation';
import { AnalyticsService } from '../../../../core/services/analytics';
import { PeriodSelectorComponent } from '../../../../shared/controls/period-selector/period-selector/period-selector';
import { AnalyticsChartsComponent } from '../analyticsChart/analytics-chart/analytics-chart';

@Component({
  selector: 'app-overview',
  standalone: true,
  // CRITICAL: PeriodSelectorComponent must be declared here
  imports: [CommonModule, RouterModule, PeriodSelectorComponent,AnalyticsChartsComponent],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview {
  dateContext = inject(DateContextService);
  transactionService = inject(TransactionAggregationService);
  analyticsService = inject(AnalyticsService);

  // Intelligently flatten the grouped dictionary from the API into a single "Recent Activity" feed
  recentActivity = computed(() => {
    const summary = this.transactionService.summaryData();
    if (!summary || !summary.groupedTransactions) return [];

    // Flatten the dictionary ( { "2026-06-23": [...] } ) into a single array of transactions
    const allTransactions = Object.values(summary.groupedTransactions).flat();

    // Sort by transaction date descending and grab the 5 most recent
    return allTransactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 5);
  });

  constructor() {
    // The Magic of Angular Signals:
    // This effect runs once on load, and then automatically re-runs EVERY time 
    // the user clicks a different period in the PeriodSelectorComponent.
    effect(() => {
      const current = this.dateContext.currentContext();
      
      // 1. Fetch the overarching summary (Income, Expense, Net Balance)
      this.transactionService.loadSummary(current.startDate, current.endDate, current.period);
      
      // 2. Fetch the category breakdown for the visual charts
      this.analyticsService.loadCategoryBreakdown('Expense', current.startDate, current.endDate);
      
      // 3. If they are looking at a broader period, fetch the trend graph data
      if (current.period === 'yearly' || current.period === 'monthly') {
        this.analyticsService.loadMonthlyTrend(current.startDate, current.endDate);
      }
    });
  }
}