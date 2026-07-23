import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ErrorService } from '../../../core/services/error.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({ selector: 'app-support', standalone: true, imports: [ReactiveFormsModule, FormErrorComponent], templateUrl: './support.component.html', styleUrls: ['./support.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class SupportComponent { private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly feedback = inject(ErrorService); readonly submitting = signal(false); readonly form = this.fb.nonNullable.group({ category: ['', Validators.required], subject: ['', [Validators.required, Validators.minLength(5)]], bookingId: [''], message: ['', [Validators.required, Validators.minLength(20)]], priority: ['Normal', Validators.required] }); submit(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.submitting()) return; this.submitting.set(true); this.api.post('support/tickets', this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe(() => { this.feedback.success('Support request submitted.'); this.form.reset({ category: '', subject: '', bookingId: '', message: '', priority: 'Normal' }); }); } }
