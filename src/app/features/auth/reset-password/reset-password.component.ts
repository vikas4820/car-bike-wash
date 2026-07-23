import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../core/models/api.model';
import { AuthService } from '../../../core/services/auth.service';
import { fieldsMatch, strongPasswordValidator } from '../../../core/validators/form.validators';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({ selector: 'app-reset-password', standalone: true, imports: [ReactiveFormsModule, RouterLink, FormErrorComponent, ThemeToggleComponent], templateUrl: './reset-password.component.html', styleUrls: ['../_auth-page.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder); private readonly auth = inject(AuthService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
  readonly submitting = signal(false); readonly errorMessage = signal(''); readonly showPassword = signal(false);
  readonly form = this.fb.nonNullable.group({ password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]], passwordConfirmation: ['', Validators.required] }, { validators: fieldsMatch('password', 'passwordConfirmation') });
  submit(): void { this.form.markAllAsTouched(); if (this.form.invalid || this.submitting()) return; const token = this.route.snapshot.queryParamMap.get('token') ?? ''; if (!token) { this.errorMessage.set('The reset link is missing or invalid.'); return; } this.submitting.set(true); const value = this.form.getRawValue(); this.auth.resetPassword(token, value.password, value.passwordConfirmation).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => void this.router.navigate(['/login'], { queryParams: { reset: 1 } }), error: (error: ApiError) => this.errorMessage.set(error.message) }); }
}
