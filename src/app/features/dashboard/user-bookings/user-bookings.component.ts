import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Booking } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-user-bookings', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './user-bookings.component.html', styleUrls: ['./user-bookings.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class UserBookingsComponent {
  private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef);
  readonly bookings = signal<Booking[]>([]);
  readonly filterForm = this.fb.nonNullable.group({ search: [''], status: [''] });
  readonly filtered = computed(() => { const { search, status } = this.filterForm.getRawValue(); const term = search.toLowerCase().trim(); return this.bookings().filter(item => (!status || item.status === status) && (!term || `${item.id} ${item.service} ${item.vehicle}`.toLowerCase().includes(term))); });
  constructor() { this.api.get<Booking[]>('bookings/my').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rows => this.bookings.set(rows)); this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.bookings.update(rows => [...rows])); }
  reset(): void { this.filterForm.reset({ search: '', status: '' }); }
  amount(value: number): string { return `₹${value.toLocaleString('en-IN')}`; }
}
