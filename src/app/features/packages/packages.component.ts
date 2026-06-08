import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { PackageDto, PagedResult, Service } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-packages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './packages.component.html'
})
export class PackagesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly isAdmin = inject(AuthService).isAdmin;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly result = signal<PagedResult<PackageDto> | null>(null);
  readonly availableServices = signal<Service[]>([]);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
    validFrom: [''],
    validUntil: [''],
    items: this.fb.array([])
  });

  get items(): FormArray { return this.form.get('items') as FormArray; }

  ngOnInit(): void { this.loadPackages(); }

  loadPackages(): void {
    this.loading.set(true);
    this.api.getPaged<PackageDto>('packages', { pageSize: 20 }).subscribe({
      next: data => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.editingId.set(null);
    this.form.reset({ price: 0, discountPercentage: 0 });
    while (this.items.length) this.items.removeAt(0);
    this.showModal.set(true);
    this.loadAvailableServices();
  }

  openEditModal(pkg: PackageDto): void {
    this.editingId.set(pkg.id);
    this.form.reset({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      discountPercentage: pkg.discountPercentage,
      validFrom: this.toDateInputValue(pkg.validFrom),
      validUntil: this.toDateInputValue(pkg.validUntil)
    });
    while (this.items.length) this.items.removeAt(0);
    for (const item of pkg.items) {
      this.items.push(this.fb.group({
        serviceId: [item.serviceId, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]]
      }));
    }
    this.showModal.set(true);
    this.loadAvailableServices();
  }

  private loadAvailableServices(): void {
    this.api.getPaged<Service>('services', { isActive: true, pageSize: 100 }).subscribe({
      next: data => this.availableServices.set(data.items)
    });
  }

  private toDateInputValue(value?: string | null): string {
    return value ? value.substring(0, 10) : '';
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  addItem(): void {
    this.items.push(this.fb.group({
      serviceId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removeItem(i: number): void { this.items.removeAt(i); }

  savePackage(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;

    const body = {
      name: v.name,
      description: v.description,
      price: v.price,
      discountPercentage: v.discountPercentage ?? 0,
      validFrom: v.validFrom || null,
      validUntil: v.validUntil || null,
      items: this.items.value
    };

    const id = this.editingId();
    const request = id
      ? this.api.put('packages/' + id, { id, ...body })
      : this.api.post('packages', body);

    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Paquete actualizado exitosamente' : 'Paquete creado exitosamente');
        this.closeModal();
        this.loadPackages();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? (id ? 'Error al actualizar el paquete' : 'Error al crear el paquete'));
      }
    });
  }
}
