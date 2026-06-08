import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Service, PagedResult, ServiceCategoryDto } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-services',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './services.component.html'
})
export class ServicesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly isAdmin = inject(AuthService).isAdmin;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly result = signal<PagedResult<Service> | null>(null);
  readonly categories = signal<ServiceCategoryDto[]>([]);

  categoryFilter: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    displayOrder: [0]
  });

  private editingImageUrl: string | null = null;

  ngOnInit(): void {
    this.loadCategories();
    this.loadServices();
  }

  loadCategories(): void {
    this.api.get<ServiceCategoryDto[]>('services/categories').subscribe({
      next: data => this.categories.set(data)
    });
  }

  loadServices(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { pageNumber: 1, pageSize: 30 };
    if (this.categoryFilter) params['categoryId'] = this.categoryFilter;
    this.api.getPaged<Service>('services', params).subscribe({
      next: data => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setCategory(id: string | null): void {
    this.categoryFilter = id;
    this.loadServices();
  }

  openModal(): void {
    this.editingId.set(null);
    this.form.reset({ durationMinutes: 30, price: 0, displayOrder: 0 });
    this.showModal.set(true);
  }

  openEditModal(service: Service): void {
    this.editingId.set(service.id);
    this.editingImageUrl = service.imageUrl ?? null;
    this.form.reset({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      categoryId: service.categoryId,
      displayOrder: service.displayOrder
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  saveService(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const id = this.editingId();
    const request = id
      ? this.api.put('services/' + id, { id, ...this.form.value, imageUrl: this.editingImageUrl })
      : this.api.post('services', this.form.value);

    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente');
        this.closeModal();
        this.loadCategories();
        this.loadServices();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? (id ? 'Error al actualizar el servicio' : 'Error al crear el servicio'));
      }
    });
  }

  toggleService(service: Service): void {
    const activate = !service.isActive;
    this.api.patch(`services/${service.id}/toggle?activate=${activate}`, {}).subscribe({
      next: () => {
        this.toast.success(activate ? 'Servicio activado' : 'Servicio desactivado');
        this.loadServices();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Error al cambiar estado del servicio')
    });
  }

  deleteService(id: string): void {
    if (!confirm('¿Eliminar este servicio?')) return;
    this.api.delete(`services/${id}`).subscribe({
      next: () => {
        this.toast.success('Servicio eliminado');
        this.loadCategories();
        this.loadServices();
      }
    });
  }
}
