import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export const roleGuard = (role: UserRole): CanActivateFn => () => {
  const auth = inject(AuthService);
  const user = auth.currentUser();
  if (!user) return inject(Router).parseUrl('/login');
  return user.role === role ? true : inject(Router).parseUrl(auth.dashboardUrl(user.role));
};
