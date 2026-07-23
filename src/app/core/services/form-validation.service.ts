import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormValidationService {
  message(control: AbstractControl | null, label = 'This field'): string {
    if (!control?.errors) return '';
    if (control.errors['server']) return String(control.errors['server']);
    if (control.errors['required']) return `${label} is required.`;
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['minlength']) return `${label} must contain at least ${control.errors['minlength'].requiredLength} characters.`;
    if (control.errors['maxlength']) return `${label} cannot exceed ${control.errors['maxlength'].requiredLength} characters.`;
    if (control.errors['pattern']) return `${label} has an invalid format.`;
    if (control.errors['strongPassword']) return 'Use uppercase, lowercase, number and special character.';
    if (control.errors['mismatch']) return 'Passwords do not match.';
    if (control.errors['requiredTrue']) return 'You must accept this before continuing.';
    if (control.errors['min']) return `${label} must be at least ${control.errors['min'].min}.`;
    return `${label} is invalid.`;
  }
}
