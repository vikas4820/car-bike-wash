import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { SessionUser, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly jwt = new JwtHelperService();

  get accessToken(): string | null {
    return localStorage.getItem(environment.accessTokenKey) ?? sessionStorage.getItem(environment.accessTokenKey);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey) ?? sessionStorage.getItem(environment.refreshTokenKey);
  }

  saveSession(accessToken: string, refreshToken: string | undefined, user: SessionUser, persistent = true): void {
    this.clearSession();
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(environment.accessTokenKey, accessToken);
    if (refreshToken) storage.setItem(environment.refreshTokenKey, refreshToken);
    storage.setItem(environment.userKey, JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem(environment.accessTokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.userKey);
    sessionStorage.removeItem(environment.accessTokenKey);
    sessionStorage.removeItem(environment.refreshTokenKey);
    sessionStorage.removeItem(environment.userKey);
  }

  getStoredUser(): SessionUser | null {
    try {
      const raw = localStorage.getItem(environment.userKey) ?? sessionStorage.getItem(environment.userKey);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }

  isTokenValid(token = this.accessToken): boolean {
    if (!token) return false;
    try {
      return !this.jwt.isTokenExpired(token);
    } catch {
      return false;
    }
  }

  getRole(token = this.accessToken): UserRole | null {
    if (!token) return null;
    try {
      const decoded = this.jwt.decodeToken<Record<string, unknown>>(token);
      const role = decoded?.['role'] ?? decoded?.['userRole'] ?? decoded?.['type'];
      return role === 'admin' ? 'admin' : role === 'user' ? 'user' : null;
    } catch {
      return null;
    }
  }
}
