import { Component } from '@angular/core';

@Component({
  selector: 'app-overview',
  standalone: true,
  template: `
    <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
      <h1 style="color: #111827; margin-bottom: 1rem;">Dashboard Overview</h1>
      <p style="color: #6B7280;">This is where we will calculate and display your Total Income, Total Expenses, and Savings Rate.</p>
    </div>
  `
})
export class Overview {}