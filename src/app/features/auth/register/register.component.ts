import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../core/models/api.model';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { fieldsMatch, strongPasswordValidator } from '../../../core/validators/form.validators';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({ selector: 'app-register', standalone: true, imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent, FormErrorComponent], templateUrl: './register.component.html', styleUrls: ['./register.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errors = inject(ErrorService);
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
    passwordConfirmation: ['', Validators.required],
    agree: [false, Validators.requiredTrue],
  }, { validators: fieldsMatch('password', 'passwordConfirmation') });

  submit(): void {
    this.errorMessage.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const { agree: _agree, ...payload } = this.form.getRawValue();
    this.auth.register(payload).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: user => void this.router.navigateByUrl(this.auth.dashboardUrl(user.role)),
      error: (error: ApiError) => {
        this.errorMessage.set(error.message || 'Unable to create your account.');
        this.errors.applyServerErrors(this.form, error.validationErrors);
      },
    });
  }
}
