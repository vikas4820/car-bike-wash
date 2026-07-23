import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFeedbackComponent } from './shared/components/global-feedback/global-feedback.component';
import { LoadingBarComponent } from './shared/components/loading-bar/loading-bar.component';

@Component({
  selector: 'app-root', standalone: true,
  imports: [RouterOutlet, GlobalFeedbackComponent, LoadingBarComponent],
  templateUrl: './app.component.html', styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
