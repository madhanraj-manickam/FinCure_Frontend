import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SavingsService } from '../../../../core/services/savingsService';
import { IncomeService } from '../../../../core/services/incomeService';
import { ExpenseService } from '../../../../core/services/expenseService';


@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview implements OnInit {
  savingsService = inject(SavingsService);
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  // A computed signal that intelligently merges and sorts incomes and expenses 
  // to create a unified "Recent Activity" feed for the dashboard.
  recentActivity = computed(() => {
    const incomes = this.incomeService.incomes().map(i => ({ 
      ...i, 
      type: 'income',
      title: 'Income Added'
    }));
    
    const expenses = this.expenseService.expenses().map(e => ({ 
      ...e, 
      type: 'expense',
      title: 'Expense Recorded'
    }));

    // Combine, sort by date descending, and take the 5 most recent
    const combined = [...incomes, ...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return combined.slice(0, 5);
  });

  ngOnInit() {
    // Load the summary metrics
    this.savingsService.loadSummary();
    
    // Load the underlying data for the recent activity feed
    // (Only triggers the API call if the arrays are currently empty to save bandwidth)
    if (this.incomeService.incomes().length === 0) {
      this.incomeService.loadIncomes();
    }
    if (this.expenseService.expenses().length === 0) {
      this.expenseService.loadExpenses();
    }
  }
}