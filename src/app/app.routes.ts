import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'barbers',
        loadComponent: () => import('./features/barbers/barbers.component').then(m => m.BarbersComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'packages',
        loadComponent: () => import('./features/packages/packages.component').then(m => m.PackagesComponent)
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/reservations/reservations.component').then(m => m.ReservationsComponent)
      },
      {
        path: 'reservations/new',
        loadComponent: () => import('./features/reservations/new-reservation/new-reservation.component').then(m => m.NewReservationComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients.component').then(m => m.ClientsComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Barber'] }
      },
      {
        path: 'schedules',
        loadComponent: () => import('./features/schedules/schedules.component').then(m => m.SchedulesComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Barber'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
