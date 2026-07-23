import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface ReportSummary { revenue: number; bookings: number; customers: number; completionRate: number; }
@Component({ selector: 'app-reports', standalone: true, imports: [ReactiveFormsModule], templateUrl: './reports.component.html', styleUrls: ['./reports.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class ReportsComponent { private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); readonly summary = signal<ReportSummary>({ revenue: 0, bookings: 0, customers: 0, completionRate: 0 }); readonly filters = this.fb.nonNullable.group({ from: ['2026-07-01'], to: ['2026-07-31'], groupBy: ['Day'] }); readonly points = '0,220 80,180 160,195 240,115 320,140 400,65 480,90 560,35 640,55'; constructor() { this.load(); } load(): void { this.api.get<ReportSummary>('reports/summary', { params: this.filters.getRawValue() }).subscribe(value => this.summary.set(value)); } money(value: number): string { return `₹${value.toLocaleString('en-IN')}`; } }
