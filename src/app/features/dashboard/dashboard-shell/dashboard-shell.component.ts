import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

interface NavItem { label: string; icon: string; link: string; }

@Component({ selector: 'app-dashboard-shell', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent], templateUrl: './dashboard-shell.component.html', styleUrls: ['./dashboard-shell.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class DashboardShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly feedback = inject(ErrorService);
  readonly mobileNavOpen = signal(false);

  readonly navigation = computed<NavItem[]>(() => this.auth.currentUser()?.role === 'admin' ? [
    { label: 'Overview', icon: 'fa-solid fa-chart-line', link: '/dashboard/admin/overview' },
    { label: 'Bookings', icon: 'fa-regular fa-calendar-check', link: '/dashboard/admin/bookings' },
    { label: 'Customers', icon: 'fa-solid fa-users', link: '/dashboard/admin/customers' },
    { label: 'Services', icon: 'fa-solid fa-spray-can-sparkles', link: '/dashboard/admin/services' },
    { label: 'Packages', icon: 'fa-solid fa-box-open', link: '/dashboard/admin/packages' },
    { label: 'Staff', icon: 'fa-solid fa-user-gear', link: '/dashboard/admin/staff' },
    { label: 'Reports', icon: 'fa-solid fa-chart-column', link: '/dashboard/admin/reports' },
    { label: 'Settings', icon: 'fa-solid fa-gear', link: '/dashboard/admin/settings' },
  ] : [
    { label: 'Overview', icon: 'fa-solid fa-house', link: '/dashboard/user/overview' },
    { label: 'My bookings', icon: 'fa-regular fa-calendar-check', link: '/dashboard/user/bookings' },
    { label: 'Book service', icon: 'fa-solid fa-plus', link: '/dashboard/user/new-booking' },
    { label: 'My vehicles', icon: 'fa-solid fa-car-side', link: '/dashboard/user/vehicles' },
    { label: 'Payments', icon: 'fa-regular fa-credit-card', link: '/dashboard/user/payments' },
    { label: 'Profile', icon: 'fa-regular fa-user', link: '/dashboard/user/profile' },
    { label: 'Support', icon: 'fa-regular fa-circle-question', link: '/dashboard/user/support' },
  ]);

  logout(): void {
    this.auth.logout();
    this.feedback.success('You have been signed out.');
    void this.router.navigateByUrl('/login');
  }
}
