import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationService } from '../../../../core/services/recommendationService';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation.html',
  styleUrls: ['./recommendation.css']
})
export class Recommendation implements OnInit {
  recommendationService = inject(RecommendationService);

  ngOnInit() {
    // Automatically fetch insights when the page loads
    this.recommendationService.loadRecommendations();
  }

  // Helper method to determine the health score color
  getScoreColor(score: number): string {
    if (score >= 80) return '#10B981'; // Emerald Green
    if (score >= 50) return '#F59E0B'; // Warning Amber
    return '#EF4444'; // Error Red
  }

  // Helper method to give a quick text label based on the score
  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Needs Improvement';
    return 'Critical';
  }
}