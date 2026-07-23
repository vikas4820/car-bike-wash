import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), title: 'ShineCraft Auto Spa' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), title: 'Login | ShineCraft' },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent), title: 'Register | ShineCraft' },
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent), title: 'Forgot password | ShineCraft' },
  { path: 'reset-password', canActivate: [guestGuard], loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent), title: 'Reset password | ShineCraft' },
  {
    path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard-shell/dashboard-shell.component').then(m => m.DashboardShellComponent),
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard-redirect/dashboard-redirect.component').then(m => m.DashboardRedirectComponent) },
      {
        path: 'user', canActivate: [roleGuard('user')], children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          { path: 'overview', loadComponent: () => import('./features/dashboard/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent), title: 'User dashboard | ShineCraft' },
          { path: 'bookings', loadComponent: () => import('./features/dashboard/user-bookings/user-bookings.component').then(m => m.UserBookingsComponent), title: 'My bookings | ShineCraft' },
          { path: 'new-booking', loadComponent: () => import('./features/dashboard/new-booking/new-booking.component').then(m => m.NewBookingComponent), title: 'Book service | ShineCraft' },
          { path: 'vehicles', loadComponent: () => import('./features/dashboard/vehicles/vehicles.component').then(m => m.VehiclesComponent), title: 'My vehicles | ShineCraft' },
          { path: 'payments', loadComponent: () => import('./features/dashboard/payments/payments.component').then(m => m.PaymentsComponent), title: 'Payments | ShineCraft' },
          { path: 'profile', loadComponent: () => import('./features/dashboard/profile/profile.component').then(m => m.ProfileComponent), title: 'Profile | ShineCraft' },
          { path: 'support', loadComponent: () => import('./features/dashboard/support/support.component').then(m => m.SupportComponent), title: 'Support | ShineCraft' },
        ],
      },
      {
        path: 'admin', canActivate: [roleGuard('admin')], children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          { path: 'overview', loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), title: 'Admin dashboard | ShineCraft' },
          { path: 'bookings', loadComponent: () => import('./features/dashboard/admin-bookings/admin-bookings.component').then(m => m.AdminBookingsComponent), title: 'Manage bookings | ShineCraft' },
          { path: 'customers', loadComponent: () => import('./features/dashboard/customers/customers.component').then(m => m.CustomersComponent), title: 'Customers | ShineCraft' },
          { path: 'services', loadComponent: () => import('./features/dashboard/services/services.component').then(m => m.ServicesComponent), title: 'Services | ShineCraft' },
          { path: 'packages', loadComponent: () => import('./features/dashboard/packages/packages.component').then(m => m.PackagesComponent), title: 'Packages | ShineCraft' },
          { path: 'staff', loadComponent: () => import('./features/dashboard/staff/staff.component').then(m => m.StaffComponent), title: 'Staff | ShineCraft' },
          { path: 'reports', loadComponent: () => import('./features/dashboard/reports/reports.component').then(m => m.ReportsComponent), title: 'Reports | ShineCraft' },
          { path: 'settings', loadComponent: () => import('./features/dashboard/settings/settings.component').then(m => m.SettingsComponent), title: 'Settings | ShineCraft' },
        ],
      },
    ],
  },
  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent), title: 'Page not found | ShineCraft' },
];
