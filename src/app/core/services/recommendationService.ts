import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RecommendationResponse {
  financialHealthScore: number;
  recommendations: string[];
  aiRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5028/api/Recommendation';

  // State management using Signals
  insights = signal<RecommendationResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  loadRecommendations(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.http.get<RecommendationResponse>(this.apiUrl).subscribe({
      next: (data) => {
        this.insights.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load AI recommendations', err);
        this.error.set('We were unable to generate your insights at this time. Please ensure you have added income and expense data.');
        this.isLoading.set(false);
      }
    });
  }
}