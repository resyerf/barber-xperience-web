import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ServiceCategoryDto } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly categories = signal<ServiceCategoryDto[]>([]);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(300)],
    displayOrder: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading.set(true);
    this.api.get<ServiceCategoryDto[]>('categories').subscribe({
      next: data => { this.categories.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal(): void {
    this.editingId.set(null);
    this.form.reset({ displayOrder: 0 });
    this.showModal.set(true);
  }

  openEditModal(cat: ServiceCategoryDto): void {
    this.editingId.set(cat.id);
    this.form.reset({ name: cat.name, description: cat.description ?? '', displayOrder: cat.displayOrder });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  saveCategory(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const request = id
      ? this.api.put(`categories/${id}`, { id, ...this.form.value })
      : this.api.post('categories', this.form.value);

    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Categoría actualizada' : 'Categoría creada');
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? 'Error al guardar la categoría');
      }
    });
  }

  toggleCategory(cat: ServiceCategoryDto): void {
    const action = cat.isActive ? 'deactivate' : 'activate';
    this.api.patch(`categories/${cat.id}/${action}`).subscribe({
      next: () => {
        this.toast.success(cat.isActive ? 'Categoría desactivada' : 'Categoría activada');
        this.loadCategories();
      },
      error: (err) => this.toast.error(err.error?.message ?? 'Error al cambiar estado')
    });
  }

  deleteCategory(cat: ServiceCategoryDto): void {
    if (cat.serviceCount > 0) {
      this.toast.error(`No se puede eliminar "${cat.name}" porque tiene ${cat.serviceCount} servicio(s) asociado(s). Desactívala en su lugar.`);
      return;
    }
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    this.api.delete(`categories/${cat.id}`).subscribe({
      next: () => { this.toast.success('Categoría eliminada'); this.loadCategories(); },
      error: (err) => this.toast.error(err.error?.message ?? 'Error al eliminar')
    });
  }
}
