import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../core/models/api.model';
import { AuthService } from '../../../core/services/auth.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({ selector: 'app-forgot-password', standalone: true, imports: [ReactiveFormsModule, RouterLink, FormErrorComponent, ThemeToggleComponent], templateUrl: './forgot-password.component.html', styleUrls: ['../_auth-page.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder); private readonly auth = inject(AuthService);
  readonly submitting = signal(false); readonly message = signal(''); readonly errorMessage = signal('');
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  submit(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.submitting()) return; this.submitting.set(true); this.errorMessage.set(''); this.auth.requestPasswordReset(this.form.controls.email.value).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: result => this.message.set(result.message || 'Reset instructions have been sent.'), error: (error: ApiError) => this.errorMessage.set(error.message) }); }
}
