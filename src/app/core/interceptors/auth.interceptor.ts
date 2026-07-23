import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenService } from '../services/token.service';
import { SKIP_AUTH_TOKEN } from './http-context.tokens';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.accessToken;
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const skip = request.context.get(SKIP_AUTH_TOKEN);

  if (!isApiRequest || skip || !token) return next(request);
  if (!tokenService.isTokenValid(token)) {
    tokenService.clearSession();
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
