import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Booking } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorService } from '../../../core/services/error.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({ selector: 'app-admin-bookings', standalone: true, imports: [ReactiveFormsModule, FormErrorComponent], templateUrl: './admin-bookings.component.html', styleUrls: ['./admin-bookings.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminBookingsComponent {
  private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly feedback = inject(ErrorService); private readonly destroyRef = inject(DestroyRef);
  readonly bookings = signal<Booking[]>([]); readonly showForm = signal(false); readonly submitting = signal(false);
  readonly filterForm = this.fb.nonNullable.group({ search: [''], status: [''], date: [''] });
  readonly bookingForm = this.fb.nonNullable.group({ customer: ['', Validators.required], phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]], service: ['', Validators.required], vehicle: ['', Validators.required], date: ['', Validators.required], time: ['', Validators.required], address: ['', Validators.required], amount: [699, [Validators.required, Validators.min(0)]], status: ['Pending' as Booking['status'], Validators.required] });
  readonly filtered = computed(() => { const { search, status, date } = this.filterForm.getRawValue(); const term = search.toLowerCase().trim(); return this.bookings().filter(item => (!status || item.status === status) && (!date || item.date === date) && (!term || `${item.id} ${item.customer} ${item.service}`.toLowerCase().includes(term))); });
  constructor() { this.load(); this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.bookings.update(rows => [...rows])); }
  load(): void { this.api.get<Booking[]>('bookings').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rows => this.bookings.set(rows)); }
  create(): void { this.bookingForm.markAllAsTouched(); if (this.bookingForm.invalid || this.submitting()) return; this.submitting.set(true); this.api.post<Booking>('bookings', this.bookingForm.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe(row => { this.bookings.update(rows => [row, ...rows]); this.feedback.success(`Booking ${row.id} created.`); this.bookingForm.reset({ customer: '', phone: '', service: '', vehicle: '', date: '', time: '', address: '', amount: 699, status: 'Pending' }); this.showForm.set(false); }); }
  amount(value: number): string { return `₹${value.toLocaleString('en-IN')}`; }
}
