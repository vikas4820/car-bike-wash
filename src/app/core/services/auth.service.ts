import { Injectable, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { AuthResponse, LoginPayload, RegisterPayload, SessionUser, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<SessionUser | null>(null);
  isAuthenticated(): boolean { return Boolean(this.currentUser()) && this.tokens.isTokenValid(); }

  constructor(private readonly api: ApiService, private readonly tokens: TokenService) {}

  login(payload: LoginPayload): Observable<SessionUser> {
    return this.api.post<AuthResponse>('auth/login', payload, { silentError: true, skipAuth: true }).pipe(
      tap(response => this.setSession(response, payload.rememberMe !== false)),
      map(response => response.user),
    );
  }

  register(payload: RegisterPayload): Observable<SessionUser> {
    return this.api.post<AuthResponse>('auth/register', payload, { silentError: true, skipAuth: true }).pipe(
      tap(response => this.setSession(response)),
      map(response => response.user),
    );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('auth/forgot-password', { email }, { silentError: true, skipAuth: true });
  }

  resetPassword(token: string, password: string, passwordConfirmation: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('auth/reset-password', { token, password, passwordConfirmation }, { silentError: true, skipAuth: true });
  }

  loadProfile(): Observable<SessionUser> {
    return this.api.get<SessionUser>('auth/me').pipe(tap(user => {
      this.currentUser.set(user);
      const accessToken = this.tokens.accessToken;
      if (accessToken) this.tokens.saveSession(accessToken, this.tokens.refreshToken ?? undefined, user);
    }));
  }

  logout(): void {
    this.tokens.clearSession();
    this.currentUser.set(null);
  }

  dashboardUrl(role: UserRole | undefined = this.currentUser()?.role): string {
    return role === 'admin' ? '/dashboard/admin/overview' : '/dashboard/user/overview';
  }

  private setSession(response: AuthResponse, persistent = true): void {
    this.tokens.saveSession(response.accessToken, response.refreshToken, response.user, persistent);
    this.currentUser.set(response.user);
  }

  private initialUser(): SessionUser | null {
    if (!this.tokens.isTokenValid()) {
      this.tokens.clearSession();
      return null;
    }
    const stored = this.tokens.getStoredUser();
    if (!stored) return null;
    const tokenRole = this.tokens.getRole();
    return tokenRole && tokenRole !== stored.role ? { ...stored, role: tokenRole } : stored;
  }
}
