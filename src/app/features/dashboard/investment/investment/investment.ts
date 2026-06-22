import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InvestmentService } from '../../../../core/services/investmentService';


@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './investment.html',
  styleUrls: ['./investment.css']
})
export class Investment implements OnInit {
  private fb = inject(FormBuilder);
  investmentService = inject(InvestmentService);

  // Initialize date to today's date in YYYY-MM-DD format for the date picker
  private today = new Date().toISOString().substring(0, 10);

  investmentForm = this.fb.nonNullable.group({
    investmentName: ['', [Validators.required, Validators.minLength(2)]],
    investmentType: ['', Validators.required],
    amountInvested: ['', [Validators.required, Validators.min(1)]],
    startDate: [this.today, Validators.required],
    notes: ['']
  });

  isSubmitting = signal<boolean>(false);

  // Asset allocation categories
  categories = ['Stocks', 'Bonds', 'Crypto', 'Real Estate', 'Mutual Funds', 'ETFs', 'Other'];

  ngOnInit() {
    this.investmentService.loadInvestments();
  }

  onSubmit() {
    if (this.investmentForm.invalid) {
      this.investmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    
    const formValue = this.investmentForm.getRawValue();
    const payload = {
      ...formValue,
      amountInvested: Number(formValue.amountInvested)
    };

    this.investmentService.addInvestment(payload).subscribe({
      next: () => {
        // Reset form but keep today's date
        this.investmentForm.reset({ 
          investmentName: '', 
          investmentType: '', 
          amountInvested: '', 
          startDate: this.today, 
          notes: '' 
        });
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Failed to add investment. Please try again.');
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm('Are you sure you want to remove this investment from your portfolio?')) {
      this.investmentService.deleteInvestment(id).subscribe();
    }
  }
}