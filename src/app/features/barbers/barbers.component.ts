import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Barber, BarberSummary, PagedResult } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, AvatarComponent, EmptyStateComponent, PaginationComponent, LoadingSpinnerComponent],
  templateUrl: './barbers.component.html'
})
export class BarbersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly result = signal<PagedResult<BarberSummary> | null>(null);

  searchTerm = '';
  activeFilter = '';
  page = 1;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phoneNumber: [''],
    specialties: ['', [Validators.required, Validators.maxLength(500)]],
    yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
    description: ['']
  });

  ngOnInit(): void { this.loadBarbers(); }

  loadBarbers(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { pageNumber: this.page, pageSize: 9 };
    if (this.searchTerm) params['search'] = this.searchTerm;
    if (this.activeFilter !== '') params['isActive'] = this.activeFilter;

    this.api.getPaged<BarberSummary>('barbers', params).subscribe({
      next: data => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page = 1; this.loadBarbers(); }, 400);
  }

  changePage(p: number): void { this.page = p; this.loadBarbers(); }

  openModal(): void {
    this.editingId.set(null);
    this.form.reset({ yearsOfExperience: 0 });
    this.form.get('email')?.enable();
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEditModal(barber: BarberSummary): void {
    this.editingId.set(barber.id);
    this.saving.set(false);

    this.api.get<Barber>(`barbers/${barber.id}`).subscribe({
      next: detail => {
        const [firstName, ...rest] = detail.fullName.split(' ');
        this.form.reset({
          firstName,
          lastName: rest.join(' '),
          email: detail.email,
          password: '',
          phoneNumber: detail.phoneNumber ?? '',
          specialties: detail.specialties,
          yearsOfExperience: detail.yearsOfExperience,
          description: detail.description ?? ''
        });
        this.form.get('email')?.disable();
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        this.showModal.set(true);
      },
      error: () => this.toast.error('No se pudo cargar el barbero')
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.form.get('email')?.enable();
    this.form.reset();
  }

  saveBarber(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const id = this.editingId();
    const request = id
      ? this.api.put(`barbers/${id}`, { id, ...this.form.getRawValue() })
      : this.api.post('barbers', this.form.value);

    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Barbero actualizado exitosamente' : 'Barbero creado exitosamente');
        this.closeModal();
        this.loadBarbers();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? (id ? 'Error al actualizar el barbero' : 'Error al crear el barbero'));
      }
    });
  }

  toggleStatus(barber: BarberSummary): void {
    const endpoint = barber.isActive ? `barbers/${barber.id}/deactivate` : `barbers/${barber.id}/activate`;
    this.api.patch(endpoint).subscribe({
      next: () => {
        this.toast.success(`Barbero ${barber.isActive ? 'desactivado' : 'activado'}`);
        this.loadBarbers();
      }
    });
  }

  deleteBarber(id: string): void {
    if (!confirm('¿Eliminar este barbero? Esta acción no se puede deshacer.')) return;
    this.api.delete(`barbers/${id}`).subscribe({
      next: () => { this.toast.success('Barbero eliminado'); this.loadBarbers(); }
    });
  }
}
