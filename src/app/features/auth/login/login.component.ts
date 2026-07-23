import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../../core/models/api.model';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({ selector: 'app-login', standalone: true, imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent, FormErrorComponent], templateUrl: './login.component.html', styleUrls: ['./login.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly errors = inject(ErrorService);

  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly submitting = signal(false);
  readonly sessionMessage = this.route.snapshot.queryParamMap.has('sessionExpired') ? 'Your session expired. Please sign in again.' : '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  submit(): void {
    this.errorMessage.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);

    this.auth.login(this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: user => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl || this.auth.dashboardUrl(user.role));
      },
      error: (error: ApiError) => {
        this.errorMessage.set(error.message || 'Unable to sign in.');
        this.errors.applyServerErrors(this.form, error.validationErrors);
      },
    });
  }
}
