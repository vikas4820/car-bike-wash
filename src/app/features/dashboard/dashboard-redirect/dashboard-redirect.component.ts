import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-dashboard-redirect', standalone: true, template: '<div class="redirecting">Opening dashboard…</div>' })
export class DashboardRedirectComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  ngOnInit(): void { this.router.navigateByUrl(this.auth.dashboardUrl(), { replaceUrl: true }); }
}
