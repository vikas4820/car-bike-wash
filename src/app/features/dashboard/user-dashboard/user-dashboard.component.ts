import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Booking, Vehicle } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({ selector: 'app-user-dashboard', standalone: true, imports: [RouterLink], templateUrl: './user-dashboard.component.html', styleUrls: ['./user-dashboard.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class UserDashboardComponent {
  readonly auth = inject(AuthService); private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef);
  readonly bookings = signal<Booking[]>([]); readonly vehicles = signal<Vehicle[]>([]);
  constructor() { forkJoin({ bookings: this.api.get<Booking[]>('bookings/my'), vehicles: this.api.get<Vehicle[]>('vehicles') }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => { this.bookings.set(result.bookings); this.vehicles.set(result.vehicles); }); }
  amount(value: number): string { return `₹${value.toLocaleString('en-IN')}`; }
}
