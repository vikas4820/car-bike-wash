import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Booking } from '../../../core/models/dashboard.model';
import { SessionUser } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-admin-dashboard', standalone: true, imports: [RouterLink], templateUrl: './admin-dashboard.component.html', styleUrls: ['./admin-dashboard.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminDashboardComponent {
  private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef);
  readonly bookings = signal<Booking[]>([]); readonly users = signal<SessionUser[]>([]);
  readonly chartValues = [54, 72, 48, 88, 67, 94, 82]; readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor() {
    forkJoin({ bookings: this.api.get<Booking[]>('bookings'), users: this.api.get<SessionUser[]>('customers') })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => { this.bookings.set(result.bookings); this.users.set(result.users); });
  }

  amount(value: number): string { return `₹${value.toLocaleString('en-IN')}`; }
  statusClass(status: string): string { return status.toLowerCase().replace(' ', '-'); }
}
