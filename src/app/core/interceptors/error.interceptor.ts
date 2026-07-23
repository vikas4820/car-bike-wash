import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { TokenService } from '../services/token.service';
import { SILENT_API_ERROR } from './http-context.tokens';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errors = inject(ErrorService);
  const tokens = inject(TokenService);
  const router = inject(Router);

  return next(request).pipe(catchError((error: unknown) => {
    if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
    const apiError = errors.mapHttpError(error);

    if (apiError.status === 401 && !request.url.includes('/auth/login')) {
      tokens.clearSession();
      errors.warning(apiError.message);
      void router.navigate(['/login'], { queryParams: { sessionExpired: 1, returnUrl: router.url } });
    } else if (!request.context.get(SILENT_API_ERROR)) {
      errors.error(apiError.message);
    }

    return throwError(() => apiError);
  }));
};
