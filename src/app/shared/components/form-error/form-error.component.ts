import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormValidationService } from '../../../core/services/form-validation.service';

@Component({ selector: 'app-form-error', standalone: true, template: '@if (control?.touched && control.invalid) { <small class="field-error">{{ validator.message(control, label) }}</small> }', styles: ['.field-error{display:block;margin-top:6px;color:var(--danger);font-size:11px;font-weight:600}'], changeDetection: ChangeDetectionStrategy.OnPush })
export class FormErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label = 'This field';
  readonly validator = inject(FormValidationService);
}
