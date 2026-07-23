import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SessionUser } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api.service';

@Component({ selector: 'app-customers', standalone: true, imports: [ReactiveFormsModule], templateUrl: './customers.component.html', styleUrls: ['./customers.component.scss'], changeDetection: ChangeDetectionStrategy.OnPush })
export class CustomersComponent { private readonly fb = inject(FormBuilder); private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef); readonly customers = signal<SessionUser[]>([]); readonly filterForm = this.fb.nonNullable.group({ search: [''], status: [''] }); readonly filtered = computed(() => { const term = this.filterForm.controls.search.value.toLowerCase().trim(); return this.customers().filter(item => item.role === 'user' && (!term || `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(term))); }); constructor() { this.api.get<SessionUser[]>('customers').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(rows => this.customers.set(rows)); this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.customers.update(rows => [...rows])); } }
