import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({ selector: 'app-loading-bar', standalone: true, template: '@if (loading.isLoading()) { <div class="api-loading-bar"></div> }', styles: ['.api-loading-bar{position:fixed;z-index:6000;top:0;left:0;width:35%;height:3px;background:var(--lime);box-shadow:0 0 16px rgba(217,255,67,.7);animation:loadingSlide 1.15s ease-in-out infinite}@keyframes loadingSlide{0%{transform:translateX(-120%)}100%{transform:translateX(400%)}}'], changeDetection: ChangeDetectionStrategy.OnPush })
export class LoadingBarComponent { readonly loading = inject(LoadingService); }
