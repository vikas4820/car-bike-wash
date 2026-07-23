import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaffMember } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';
import { ErrorService } from '../../../core/services/error.service';

@Component({ selector: 'app-staff', standalone: true, imports: [ReactiveFormsModule], templateUrl: './staff.component.html', styleUrls: ['./staff.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class StaffComponent { private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly feedback = inject(ErrorService); private readonly destroyRef = inject(DestroyRef); readonly staff = signal<StaffMember[]>([]); readonly showForm = signal(false); readonly form = this.fb.nonNullable.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], phone: ['', Validators.required], role: ['', Validators.required], status: ['Active' as StaffMember['status']] }); constructor() { this.api.get<StaffMember[]>('staff').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rows => this.staff.set(rows)); } save(): void { this.form.markAllAsTouched(); if (this.form.invalid) return; const value = this.form.getRawValue(); const row: StaffMember = { id: crypto.randomUUID(), ...value, rating: 5, jobsToday: 0 }; this.api.post<StaffMember>('staff', value).subscribe(() => { this.staff.update(rows => [...rows, row]); this.showForm.set(false); this.feedback.success('Staff member added.'); }); } }
