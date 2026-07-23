import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ErrorService } from '../../../core/services/error.service';

interface AppSettings { companyName: string; phone: string; email: string; taxRate: number; bookingWindow: number; notifications: boolean; }
@Component({ selector: 'app-settings', standalone: true, imports: [ReactiveFormsModule], templateUrl: './settings.component.html', styleUrls: ['./settings.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class SettingsComponent { private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly feedback = inject(ErrorService); readonly saving = signal(false); readonly form = this.fb.nonNullable.group({ companyName: ['', Validators.required], phone: ['', Validators.required], email: ['', [Validators.required, Validators.email]], taxRate: [18, [Validators.min(0), Validators.max(100)]], bookingWindow: [30, Validators.min(1)], notifications: [true], autoConfirm: [false], maintenanceMode: [false] }); constructor() { this.api.get<AppSettings>('settings').subscribe(value => this.form.patchValue(value)); } save(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.saving()) return; this.saving.set(true); this.api.put('settings', this.form.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe(() => this.feedback.success('Settings saved.')); } }
