import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  const valid = /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
  return valid ? null : { strongPassword: true };
};

export function fieldsMatch(first: string, second: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const firstControl = control.get(first);
    const secondControl = control.get(second);
    if (!firstControl || !secondControl || firstControl.value === secondControl.value) return null;
    secondControl.setErrors({ ...secondControl.errors, mismatch: true });
    return { mismatch: true };
  };
}
