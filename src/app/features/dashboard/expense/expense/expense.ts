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
    description: [''] ,// Optional field based on your DTO
    date: [new Date().toISOString().substring(0, 10), Validators.required]
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

    // PRODUCTION FIX: Construct the payload using the raw date string.
    // Do NOT use new Date(formValue.date).toISOString() as it triggers the UTC shift.
    const payload = {
      amount: Number(formValue.amount),
      category: formValue.category,
      
      description: formValue.description,
      
      // Sends exactly "2026-06-23" to the C# Backend
      date: formValue.date 
    };

    this.expenseService.addExpense(payload).subscribe({
      next: () => {
        // Reset form but keep today's date as the default
        this.expenseForm.reset({ 
          amount: '', 
          category: '', 
         
          description: '',
          date: new Date().toISOString().substring(0, 10) 
        });
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Failed to add expense.');
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Are you sure you want to delete this expense record?')) {
      this.expenseService.deleteExpense(id).subscribe();
    }
  }
}