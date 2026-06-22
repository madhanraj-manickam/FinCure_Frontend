import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExpenseService } from '../../../../core/services/expenseService';


@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense.html',
  styleUrls: ['./expense.css']
})
export class Expense implements OnInit {
  private fb = inject(FormBuilder);
  expenseService = inject(ExpenseService);

  expenseForm = this.fb.nonNullable.group({
    amount: ['', [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    description: [''] // Optional field based on your DTO
  });

  isSubmitting = signal<boolean>(false);

  // Common expense categories
  categories = ['Housing', 'Food & Dining', 'Transportation', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Other'];

  ngOnInit() {
    this.expenseService.loadExpenses();
  }

  onSubmit() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    
    const formValue = this.expenseForm.getRawValue();
    const payload = {
      ...formValue,
      amount: Number(formValue.amount)
    };

    this.expenseService.addExpense(payload).subscribe({
      next: () => {
        this.expenseForm.reset({ amount: '', category: '', description: '' });
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Failed to add expense. Please try again.');
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Are you sure you want to delete this expense record?')) {
      this.expenseService.deleteExpense(id).subscribe();
    }
  }
}