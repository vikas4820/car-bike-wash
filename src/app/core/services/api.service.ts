import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, ApiError, QueryParams } from '../models/api.model';
import { Booking, PaymentRecord, ServicePlan, StaffMember, Vehicle } from '../models/dashboard.model';
import { AuthResponse, LoginPayload, RegisterPayload, SessionUser } from '../models/user.model';
import { SILENT_API_ERROR, SKIP_AUTH_TOKEN } from '../interceptors/http-context.tokens';

export interface ApiRequestOptions {
  params?: QueryParams;
  headers?: HttpHeaders | Record<string, string | string[]>;
  silentError?: boolean;
  skipAuth?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly mockUsersKey = 'shinecraft_mock_api_users';

  constructor(private readonly http: HttpClient) {
    if (environment.useMockApi) this.seedMockUsers();
  }

  get<T>(endpoint: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  post<T>(endpoint: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  put<T>(endpoint: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  patch<T>(endpoint: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  delete<T>(endpoint: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  upload<T>(endpoint: string, formData: FormData, options: ApiRequestOptions = {}): Observable<T> {
    return this.post<T>(endpoint, formData, options);
  }

  private request<T>(method: string, endpoint: string, body?: unknown, options: ApiRequestOptions = {}): Observable<T> {
    if (environment.useMockApi) return this.mockRequest<T>(method, endpoint, body, options.params);

    const context = new HttpContext()
      .set(SILENT_API_ERROR, Boolean(options.silentError))
      .set(SKIP_AUTH_TOKEN, Boolean(options.skipAuth));

    return this.http.request<ApiEnvelope<T> | T>(method, this.url(endpoint), {
      body,
      params: this.toHttpParams(options.params),
      headers: options.headers,
      context,
    }).pipe(map(response => this.unwrap(response)));
  }

  private unwrap<T>(response: ApiEnvelope<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiEnvelope<T>).data;
    }
    return response as T;
  }

  private url(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    return `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
  }

  private toHttpParams(params: QueryParams | undefined): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) value.forEach(item => { httpParams = httpParams.append(key, String(item)); });
      else httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }

  private mockRequest<T>(method: string, rawEndpoint: string, body?: unknown, params?: QueryParams): Observable<T> {
    const endpoint = rawEndpoint.replace(/^\//, '').split('?')[0];
    const respond = <R>(value: R, wait = 320): Observable<T> => of(value as unknown as T).pipe(delay(wait));

    if (method === 'POST' && endpoint === 'auth/login') {
      const payload = body as LoginPayload;
      const user = this.readMockUsers().find(item => item.email.toLowerCase() === payload.email.trim().toLowerCase());
      const passwords: Record<string, string> = { 'admin@shinecraft.in': 'Admin@123', 'user@shinecraft.in': 'User@123' };
      const registeredPassword = localStorage.getItem(`mock_password_${payload.email.toLowerCase()}`);
      if (!user || (passwords[user.email] ?? registeredPassword) !== payload.password) {
        return this.mockError<T>(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }
      return respond(this.authResponse(user));
    }

    if (method === 'POST' && endpoint === 'auth/register') {
      const payload = body as RegisterPayload;
      const users = this.readMockUsers();
      if (users.some(user => user.email.toLowerCase() === payload.email.trim().toLowerCase())) {
        return this.mockError<T>(409, 'EMAIL_EXISTS', 'An account already exists with this email.');
      }
      const user: SessionUser = {
        id: crypto.randomUUID(), name: payload.name.trim(), email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(), role: 'user', createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(this.mockUsersKey, JSON.stringify(users));
      localStorage.setItem(`mock_password_${user.email}`, payload.password);
      return respond(this.authResponse(user), 500);
    }

    if (endpoint === 'auth/me') {
      return respond(this.readMockUsers()[1]);
    }

    if (endpoint === 'bookings/my') return respond(this.mockBookings().filter(item => item.customer === 'Aditya Kumar'));
    if (endpoint === 'bookings' && method === 'GET') {
      const status = String(params?.['status'] ?? '');
      const search = String(params?.['search'] ?? '').toLowerCase();
      let rows = this.mockBookings();
      if (status) rows = rows.filter(item => item.status === status);
      if (search) rows = rows.filter(item => `${item.id} ${item.customer} ${item.service}`.toLowerCase().includes(search));
      return respond(rows);
    }
    if (endpoint === 'bookings' && method === 'POST') {
      const payload = body as Partial<Booking>;
      return respond({
        id: `SC-${Math.floor(3000 + Math.random() * 6000)}`,
        customer: payload.customer ?? 'Current user', service: payload.service ?? 'Essential Wash',
        vehicle: payload.vehicle ?? 'Vehicle', date: payload.date ?? new Date().toISOString().slice(0, 10),
        time: payload.time ?? '10:00 AM – 12:00 PM', address: payload.address ?? '', amount: payload.amount ?? 699,
        paymentStatus: payload.paymentStatus ?? 'Pending', status: payload.status ?? 'Pending',
      } satisfies Booking, 650);
    }

    if (endpoint === 'vehicles' && method === 'GET') return respond(this.mockVehicles());
    if (endpoint === 'vehicles' && method === 'POST') {
      return respond({ id: crypto.randomUUID(), ...(body as Omit<Vehicle, 'id'>) } as Vehicle, 550);
    }
    if (endpoint.startsWith('vehicles/') && method === 'DELETE') return respond({ success: true });

    if (endpoint === 'payments' && method === 'GET') return respond(this.mockPayments());
    if (endpoint === 'services' && method === 'GET') return respond(this.mockServices());
    if (endpoint === 'services' && method === 'POST') return respond({ id: crypto.randomUUID(), ...(body as object) });
    if (endpoint.startsWith('services/') && ['PUT', 'PATCH'].includes(method)) return respond(body);
    if (endpoint === 'packages' && method === 'GET') return respond(this.mockServices().slice(0, 3));
    if (endpoint === 'packages' && method === 'POST') return respond({ id: crypto.randomUUID(), ...(body as object) });
    if (endpoint === 'staff' && method === 'GET') return respond(this.mockStaff());
    if (endpoint === 'staff' && method === 'POST') return respond({ id: crypto.randomUUID(), ...(body as object) });
    if (endpoint === 'customers' && method === 'GET') return respond(this.readMockUsers());
    if (endpoint === 'reports/summary' && method === 'GET') return respond({ revenue: 286400, bookings: 184, customers: 96, completionRate: 91.8 });
    if (endpoint === 'settings' && method === 'GET') return respond({ companyName: 'ShineCraft Auto Spa', phone: '+91 98765 43210', email: 'hello@shinecraft.in', taxRate: 18, bookingWindow: 30, notifications: true });
    if (endpoint === 'callbacks' && method === 'POST') return respond({ message: 'Callback request received. We will contact you shortly.' }, 520);
    if (endpoint === 'auth/forgot-password' && method === 'POST') return respond({ message: 'Password reset instructions have been sent.' }, 520);
    if (endpoint === 'auth/reset-password' && method === 'POST') return respond({ message: 'Password updated successfully.' }, 520);
    if (['profile', 'settings', 'support/tickets'].includes(endpoint) && ['POST', 'PUT', 'PATCH'].includes(method)) return respond(body, 600);

    return respond([] as unknown as T);
  }

  private authResponse(user: SessionUser): AuthResponse {
    const now = Math.floor(Date.now() / 1000);
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role, iat: now, exp: now + 60 * 60 * 8 };
    return { accessToken: this.fakeJwt(payload), refreshToken: `mock-refresh-${user.id}`, user };
  }

  private fakeJwt(payload: Record<string, unknown>): string {
    const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.mock-signature`;
  }

  private mockError<T>(status: number, code: string, message: string, validationErrors?: Record<string, string[]>): Observable<T> {
    const error: ApiError = { status, code, message, validationErrors };
    return throwError(() => error).pipe(delay(300));
  }

  private seedMockUsers(): void {
    if (this.readMockUsers().length) return;
    const users: SessionUser[] = [
      { id: 'admin-demo', name: 'ShineCraft Admin', email: 'admin@shinecraft.in', phone: '+91 98765 43210', role: 'admin', createdAt: '2026-01-04T10:00:00.000Z' },
      { id: 'user-demo', name: 'Aditya Kumar', email: 'user@shinecraft.in', phone: '+91 91234 56789', role: 'user', createdAt: '2026-04-18T10:00:00.000Z' },
      { id: 'user-3', name: 'Priya Singh', email: 'priya@example.com', phone: '+91 90000 10001', role: 'user', createdAt: '2026-06-02T10:00:00.000Z' },
      { id: 'user-4', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '+91 90000 10002', role: 'user', createdAt: '2026-06-12T10:00:00.000Z' },
    ];
    localStorage.setItem(this.mockUsersKey, JSON.stringify(users));
  }

  private readMockUsers(): SessionUser[] {
    try {
      return JSON.parse(localStorage.getItem(this.mockUsersKey) ?? '[]') as SessionUser[];
    } catch {
      return [];
    }
  }

  private mockBookings(): Booking[] {
    return [
      { id: 'SC-2051', customer: 'Aditya Kumar', service: 'Complete Detail', vehicle: 'Hyundai Creta', date: '2026-07-24', time: '4:00 PM – 6:00 PM', address: 'Gomti Nagar, Lucknow', amount: 1499, paymentStatus: 'Paid', status: 'Confirmed', technician: 'Arjun Patel' },
      { id: 'SC-2048', customer: 'Rohan Mehta', service: 'Complete Detail', vehicle: 'Hyundai Creta', date: '2026-07-24', time: '4:00 PM – 6:00 PM', address: 'Gomti Nagar, Lucknow', amount: 1499, paymentStatus: 'Paid', status: 'Confirmed', technician: 'Arjun Patel' },
      { id: 'SC-2047', customer: 'Priya Singh', service: 'Essential Wash', vehicle: 'Royal Enfield Classic', date: '2026-07-23', time: '2:00 PM – 4:00 PM', address: 'Hazratganj, Lucknow', amount: 299, paymentStatus: 'Pending', status: 'Pending' },
      { id: 'SC-2046', customer: 'Amit Verma', service: 'Signature Protection', vehicle: 'Honda City', date: '2026-07-21', time: '11:00 AM – 2:00 PM', address: 'Indira Nagar, Lucknow', amount: 3999, paymentStatus: 'Paid', status: 'Completed', technician: 'Sameer Khan' },
      { id: 'SC-2045', customer: 'Neha Kapoor', service: 'Interior Deep Clean', vehicle: 'Kia Seltos', date: '2026-07-20', time: '5:00 PM – 7:00 PM', address: 'Aliganj, Lucknow', amount: 1299, paymentStatus: 'Paid', status: 'Completed', technician: 'Arjun Patel' },
      { id: 'SC-2044', customer: 'Aditya Kumar', service: 'Essential Wash', vehicle: 'Hyundai Creta', date: '2026-07-05', time: '10:00 AM – 12:00 PM', address: 'Gomti Nagar, Lucknow', amount: 699, paymentStatus: 'Paid', status: 'Completed', technician: 'Sameer Khan' },
      { id: 'SC-2043', customer: 'Aditya Kumar', service: 'Interior Deep Clean', vehicle: 'Hyundai Creta', date: '2026-06-12', time: '2:00 PM – 4:00 PM', address: 'Gomti Nagar, Lucknow', amount: 1299, paymentStatus: 'Paid', status: 'Completed', technician: 'Arjun Patel' },
    ];
  }

  private mockVehicles(): Vehicle[] {
    return [
      { id: 'v1', type: 'Car', make: 'Hyundai', model: 'Creta', registrationNumber: 'UP32 AB 4581', color: 'White', primary: true },
      { id: 'v2', type: 'Bike', make: 'Royal Enfield', model: 'Classic 350', registrationNumber: 'UP32 CD 9204', color: 'Black' },
    ];
  }

  private mockPayments(): PaymentRecord[] {
    return [
      { id: 'PAY-8841', bookingId: 'SC-2044', date: '2026-07-05', method: 'UPI', amount: 699, status: 'Paid' },
      { id: 'PAY-8720', bookingId: 'SC-2043', date: '2026-06-12', method: 'Card', amount: 1299, status: 'Paid' },
      { id: 'PAY-8534', bookingId: 'SC-1998', date: '2026-05-18', method: 'Cash', amount: 699, status: 'Paid' },
    ];
  }

  private mockServices(): ServicePlan[] {
    return [
      { id: 's1', name: 'Essential Wash', category: 'Wash', durationMinutes: 60, carPrice: 699, bikePrice: 299, active: true, description: 'Exterior wash, wheels, glass and drying.' },
      { id: 's2', name: 'Complete Detail', category: 'Detailing', durationMinutes: 180, carPrice: 1499, bikePrice: 699, active: true, description: 'Full interior and exterior detailing.' },
      { id: 's3', name: 'Signature Protection', category: 'Protection', durationMinutes: 300, carPrice: 3999, bikePrice: 1699, active: true, description: 'Correction, polish and paint protection.' },
      { id: 's4', name: 'Interior Deep Clean', category: 'Interior', durationMinutes: 120, carPrice: 1299, bikePrice: 0, active: true, description: 'Seats, carpets, dashboard and cabin cleaning.' },
    ];
  }

  private mockStaff(): StaffMember[] {
    return [
      { id: 'st1', name: 'Arjun Patel', email: 'arjun@shinecraft.in', phone: '+91 90010 11223', role: 'Senior Detailer', status: 'Active', rating: 4.9, jobsToday: 4 },
      { id: 'st2', name: 'Sameer Khan', email: 'sameer@shinecraft.in', phone: '+91 90010 44556', role: 'Detailing Technician', status: 'Active', rating: 4.8, jobsToday: 3 },
      { id: 'st3', name: 'Vikas Yadav', email: 'vikas@shinecraft.in', phone: '+91 90010 77889', role: 'Wash Technician', status: 'On leave', rating: 4.7, jobsToday: 0 },
    ];
  }
}
