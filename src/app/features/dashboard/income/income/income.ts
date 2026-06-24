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
    category: ['', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required]
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
    const formValue = this.incomeForm.getRawValue();

    // PRODUCTION FIX: Construct the payload using the raw date string.
    // Do NOT use new Date(formValue.date).toISOString() as it triggers the UTC shift.
    const payload = {
      amount: Number(formValue.amount),
      category: formValue.category,
      
      
      
      // Sends exactly "2026-06-23" to the C# Backend
      date: formValue.date 
    };

    this.incomeService.addIncome(payload).subscribe({
      next: () => {
        // Reset form but keep today's date as the default
        this.incomeForm.reset({ 
          amount: '', 
          category: '', 
         
        
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
    if (confirm('Are you sure you want to delete this income record?')) {
      this.incomeService.deleteIncome(id).subscribe();
    }
  }
}