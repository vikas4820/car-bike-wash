import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiError } from '../models/api.model';

export type FeedbackType = 'error' | 'success' | 'info' | 'warning';
export interface FeedbackMessage { id: number; type: FeedbackType; message: string; }

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private nextId = 1;
  readonly messages = signal<FeedbackMessage[]>([]);

  success(message: string): void { this.push('success', message); }
  info(message: string): void { this.push('info', message); }
  warning(message: string): void { this.push('warning', message); }
  error(message: string): void { this.push('error', message); }

  dismiss(id: number): void {
    this.messages.update(items => items.filter(item => item.id !== id));
  }

  mapHttpError(error: HttpErrorResponse): ApiError {
    const body = error.error as Record<string, unknown> | string | null;
    const validationErrors = this.extractValidationErrors(body);
    const apiMessage = typeof body === 'object' && body
      ? String(body['message'] ?? body['error'] ?? '')
      : typeof body === 'string' ? body : '';

    const messages: Record<number, string> = {
      0: 'Unable to reach the server. Check your connection and try again.',
      400: apiMessage || 'The request is invalid. Please check the submitted information.',
      401: apiMessage || 'Your session is invalid or has expired. Please sign in again.',
      403: apiMessage || 'You do not have permission to perform this action.',
      404: apiMessage || 'The requested record could not be found.',
      408: apiMessage || 'The request timed out. Please try again.',
      409: apiMessage || 'This request conflicts with an existing record.',
      422: apiMessage || 'Some submitted values are invalid.',
      429: apiMessage || 'Too many requests. Please wait a moment and try again.',
      500: 'The server encountered an unexpected error.',
      502: 'The service is temporarily unavailable.',
      503: 'The service is temporarily unavailable.',
      504: 'The server took too long to respond.',
    };

    return {
      status: error.status,
      code: this.extractCode(body, error.status),
      message: messages[error.status] ?? (apiMessage || 'Something went wrong. Please try again.'),
      validationErrors,
      details: error.error,
    };
  }

  applyServerErrors(form: FormGroup, errors: Record<string, string[]> | undefined): void {
    if (!errors) return;
    Object.entries(errors).forEach(([field, messages]) => {
      const control = form.get(field);
      if (control) control.setErrors({ ...control.errors, server: messages[0] });
    });
  }

  private push(type: FeedbackType, message: string): void {
    const id = this.nextId++;
    this.messages.update(items => [...items, { id, type, message }]);
    window.setTimeout(() => this.dismiss(id), type === 'error' ? 6500 : 4200);
  }

  private extractValidationErrors(body: Record<string, unknown> | string | null): Record<string, string[]> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const source = body['errors'] ?? body['validationErrors'];
    if (!source || typeof source !== 'object') return undefined;
    return Object.fromEntries(Object.entries(source as Record<string, unknown>).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : [String(value)],
    ]));
  }

  private extractCode(body: Record<string, unknown> | string | null, status: number): string {
    if (body && typeof body === 'object' && body['code']) return String(body['code']);
    return `HTTP_${status || 'NETWORK'}`;
  }
}
