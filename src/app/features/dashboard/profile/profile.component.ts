import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionUser } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({ selector: 'app-profile', standalone: true, imports: [ReactiveFormsModule, FormErrorComponent], templateUrl: './profile.component.html', styleUrls: ['./profile.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class ProfileComponent {
  private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); readonly auth = inject(AuthService); private readonly feedback = inject(ErrorService); readonly submitting = signal(false);
  readonly form = this.fb.nonNullable.group({ name: [this.auth.currentUser()?.name ?? '', [Validators.required, Validators.minLength(2)]], email: [this.auth.currentUser()?.email ?? '', [Validators.required, Validators.email]], phone: [this.auth.currentUser()?.phone ?? '', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]], address: ['Gomti Nagar, Lucknow'], city: ['Lucknow'], postcode: ['226010'] });
  submit(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.submitting()) return; this.submitting.set(true); this.api.put<SessionUser>('profile', this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe(() => { const current = this.auth.currentUser(); if (current) this.auth.currentUser.set({ ...current, ...this.form.getRawValue() }); this.feedback.success('Profile updated successfully.'); }); }
}
