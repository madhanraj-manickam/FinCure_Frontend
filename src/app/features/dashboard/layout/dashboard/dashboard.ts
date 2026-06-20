import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  private authService = inject(AuthService);
  private router = inject(Router);

  // We read the currentUser signal from the AuthService directly
  currentUser = this.authService.currentUser;
  
  // State for mobile sidebar toggle
  isSidebarOpen = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  logout() {
    // Note: In a full app, you might also want to call your backend /logout API here
    localStorage.removeItem('fincure_auth_token');
    this.authService.currentUser.set(null);
    this.authService.token.set(null);
    this.router.navigate(['/login']);
  }
}