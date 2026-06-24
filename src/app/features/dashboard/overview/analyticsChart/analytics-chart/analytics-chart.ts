import { Component, ElementRef, ViewChild, inject, effect, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { AnalyticsService } from '../../../../../core/services/analytics';

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Expense Breakdown</h3>
        <p class="chart-subtitle" *ngIf="analyticsService.expenseCategories().length === 0">No data for this period.</p>
        <div class="canvas-container">
          <canvas #doughnutChart></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>Income vs Expense Trend</h3>
        <p class="chart-subtitle" *ngIf="analyticsService.monthlyTrend().length === 0">Select 'Monthly' or 'Yearly' to view trends.</p>
        <div class="canvas-container">
          <canvas #lineChart></canvas>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./analytics-chart.css']
})
export class AnalyticsChartsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('doughnutChart') doughnutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineCanvas!: ElementRef<HTMLCanvasElement>;

  analyticsService = inject(AnalyticsService);
  
  private doughnutChartInstance: Chart | null = null;
  private lineChartInstance: Chart | null = null;

  // FinCure Brand Colors for the charts
  private colors = ['#16A34A', '#06B6D4', '#D4A017', '#EF4444', '#8B5CF6', '#F97316', '#14B8A6'];

  constructor() {
    // The effect listens to the data signals. When data changes, it redraws the charts.
    effect(() => {
      const categories = this.analyticsService.expenseCategories();
      const trends = this.analyticsService.monthlyTrend();

      // Ensure the DOM has rendered the canvas elements before trying to draw
      setTimeout(() => {
        if (this.doughnutCanvas) this.renderDoughnut(categories);
        if (this.lineCanvas) this.renderLine(trends);
      }, 0);
    });
  }

  ngAfterViewInit() {
    // Initial render attempt once the view is ready
    this.renderDoughnut(this.analyticsService.expenseCategories());
    this.renderLine(this.analyticsService.monthlyTrend());
  }

  ngOnDestroy() {
    if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();
    if (this.lineChartInstance) this.lineChartInstance.destroy();
  }

  private renderDoughnut(data: any[]) {
    if (!this.doughnutCanvas) return;
    
    // Destroy the old chart if it exists before drawing a new one
    if (this.doughnutChartInstance) this.doughnutChartInstance.destroy();

    const labels = data.map(d => d.category);
    const amounts = data.map(d => d.amount);

    this.doughnutChartInstance = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: this.colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
        },
        cutout: '70%' // Makes it a sleek thin ring
      }
    });
  }

  private renderLine(data: any[]) {
    if (!this.lineCanvas) return;
    if (this.lineChartInstance) this.lineChartInstance.destroy();

    const labels = data.map(d => d.periodLabel);
    const incomes = data.map(d => d.income);
    const expenses = data.map(d => d.expense);

    this.lineChartInstance = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomes,
            borderColor: '#16A34A', // FinCure Green
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4 // Smooth curves
          },
          {
            label: 'Expense',
            data: expenses,
            borderColor: '#EF4444', // Red
            backgroundColor: 'transparent',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F3F4F6' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}