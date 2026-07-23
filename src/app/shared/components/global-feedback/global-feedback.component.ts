import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-global-feedback',
  standalone: true,
  templateUrl: './global-feedback.component.html',
  styleUrl: './global-feedback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalFeedbackComponent {
  readonly feedback = inject(ErrorService);
}
