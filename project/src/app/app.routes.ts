// Route mappings for CampusCart Campus Exchange
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'sell',
        loadComponent: () => import('./sell.component').then(m => m.SellComponent)
      },
      {
        path: 'buy',
        loadComponent: () => import('./buy.component').then(m => m.BuyComponent)
      },
      {
        path: 'my-listings',
        loadComponent: () => import('./my-listings.component').then(m => m.MyListingsComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'verification',
        loadComponent: () => import('./verification.component').then(m => m.VerificationComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'lost-found',
        loadComponent: () => import('./notices.component').then(m => m.NoticesComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
