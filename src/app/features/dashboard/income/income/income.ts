import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IncomeService } from '../../../../core/services/incomeService';


@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income.html',
  styleUrls: ['./income.css']
})
export class Income implements OnInit {
  private fb = inject(FormBuilder);
  incomeService = inject(IncomeService); // Public to access signals in HTML

  incomeForm = this.fb.nonNullable.group({
    amount: ['', [Validators.required, Validators.min(1)]],
    category: ['', Validators.required]
  });

  isSubmitting = signal<boolean>(false);

  // Pre-defined categories for a cleaner UX
  categories = ['Salary', 'Freelance', 'Investments', 'Business', 'Bonus', 'Other'];

  ngOnInit() {
    this.incomeService.loadIncomes();
  }

  onSubmit() {
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    
    // Ensure amount is parsed as a number for the backend DTO
    const formValue = this.incomeForm.getRawValue();
    const payload = {
      ...formValue,
      amount: Number(formValue.amount)
    };

    this.incomeService.addIncome(payload).subscribe({
      next: () => {
        this.incomeForm.reset({ amount: '', category: '' });
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Failed to add income. Please try again.');
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Are you sure you want to delete this income record?')) {
      this.incomeService.deleteIncome(id).subscribe();
    }
  }
}