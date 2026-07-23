import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentRecord } from '../../../core/models/dashboard.model';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-payments', standalone: true, templateUrl: './payments.component.html', styleUrls: ['./payments.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class PaymentsComponent { private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef); readonly payments = signal<PaymentRecord[]>([]); constructor() { this.api.get<PaymentRecord[]>('payments').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rows => this.payments.set(rows)); } amount(value: number): string { return `₹${value.toLocaleString('en-IN')}`; } total(): number { return this.payments().reduce((sum, item) => sum + item.amount, 0); } }
