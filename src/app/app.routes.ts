import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  
  { 
    path: 'dashboard', 
    canActivate: [authGuard], 
    loadComponent: () => import('./features/dashboard/layout/dashboard/dashboard').then(m => m.Dashboard),
    // EVERYTHING inside 'children' will load inside the layout's <router-outlet>
    children: [
      { path: 'overview', loadComponent: () => import('./features/dashboard/overview/overview/overview').then(m => m.Overview) },
      // Later we will add:
    { path: 'incomes', loadComponent: () => import('./features/dashboard/income/income/income').then(m => m.Income) },
      // { path: 'expenses', ... },
      { path: 'expenses', loadComponent: () => import('./features/dashboard/expense/expense/expense').then(m => m.Expense) },

      { path: 'investments', loadComponent: () => import('./features/dashboard/investment/investment/investment').then(m => m.Investment) },

      { path: 'recommendations', loadComponent: () => import('./features/dashboard/recommendation/recommendation/recommendation').then(m => m.Recommendation) },
      
      // Default to overview when visiting /dashboard
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];