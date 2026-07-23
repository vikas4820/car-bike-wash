import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Vehicle } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorService } from '../../../core/services/error.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({ selector: 'app-vehicles', standalone: true, imports: [ReactiveFormsModule, FormErrorComponent], templateUrl: './vehicles.component.html', styleUrls: ['./vehicles.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class VehiclesComponent {
  private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly feedback = inject(ErrorService); private readonly destroyRef = inject(DestroyRef);
  readonly vehicles = signal<Vehicle[]>([]); readonly showForm = signal(false); readonly submitting = signal(false);
  readonly form = this.fb.nonNullable.group({ type: ['Car' as 'Car' | 'Bike', Validators.required], make: ['', Validators.required], model: ['', Validators.required], registrationNumber: ['', [Validators.required, Validators.minLength(6)]], color: ['', Validators.required], primary: [false] });
  constructor() { this.load(); }
  load(): void { this.api.get<Vehicle[]>('vehicles').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rows => this.vehicles.set(rows)); }
  submit(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.submitting()) return; this.submitting.set(true); this.api.post<Vehicle>('vehicles', this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe(vehicle => { this.vehicles.update(rows => [...rows, vehicle]); this.form.reset({ type: 'Car', make: '', model: '', registrationNumber: '', color: '', primary: false }); this.showForm.set(false); this.feedback.success('Vehicle added successfully.'); }); }
  remove(vehicle: Vehicle): void { this.api.delete<{ success: boolean }>(`vehicles/${vehicle.id}`).subscribe(() => { this.vehicles.update(rows => rows.filter(item => item.id !== vehicle.id)); this.feedback.success('Vehicle removed.'); }); }
}
