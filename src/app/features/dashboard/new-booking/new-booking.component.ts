import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ApiError } from '../../../core/models/api.model';
import { Booking, ServicePlan, Vehicle } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorService } from '../../../core/services/error.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({ selector: 'app-new-booking', standalone: true, imports: [ReactiveFormsModule, FormErrorComponent], templateUrl: './new-booking.component.html', styleUrls: ['./new-booking.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class NewBookingComponent {
  private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly errors = inject(ErrorService); private readonly router = inject(Router); private readonly destroyRef = inject(DestroyRef);
  readonly vehicles = signal<Vehicle[]>([]); readonly services = signal<ServicePlan[]>([]); readonly submitting = signal(false); readonly minDate = new Date().toISOString().slice(0, 10);
  readonly form = this.fb.nonNullable.group({ vehicleId: ['', Validators.required], serviceId: ['', Validators.required], date: ['', Validators.required], time: ['', Validators.required], address: ['', [Validators.required, Validators.minLength(8)]], notes: ['', Validators.maxLength(500)], paymentMethod: ['Pay after service', Validators.required] });
  constructor() { forkJoin({ vehicles: this.api.get<Vehicle[]>('vehicles'), services: this.api.get<ServicePlan[]>('services') }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => { this.vehicles.set(result.vehicles); this.services.set(result.services); }); }
  submit(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.submitting()) return; const value = this.form.getRawValue(); const vehicle = this.vehicles().find(item => item.id === value.vehicleId); const service = this.services().find(item => item.id === value.serviceId); if (!vehicle || !service) return; this.submitting.set(true); this.api.post<Booking>('bookings', { vehicle: `${vehicle.make} ${vehicle.model}`, vehicleId: vehicle.id, service: service.name, date: value.date, time: value.time, address: value.address, notes: value.notes, amount: vehicle.type === 'Car' ? service.carPrice : service.bikePrice }).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: booking => { this.errors.success(`Booking ${booking.id} was created.`); void this.router.navigateByUrl('/dashboard/user/bookings'); }, error: (error: ApiError) => this.errors.applyServerErrors(this.form, error.validationErrors) }); }
}
