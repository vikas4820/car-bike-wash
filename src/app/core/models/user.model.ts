export type UserRole = 'user' | 'admin';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: SessionUser;
}
