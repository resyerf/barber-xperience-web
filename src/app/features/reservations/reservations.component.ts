import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Reservation, PagedResult, ReservationStatus } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './reservations.component.html'
})
export class ReservationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly result = signal<PagedResult<Reservation> | null>(null);
  dateFrom = '';
  dateTo = '';
  statusFilter = '';
  page = 1;

  readonly statusOptions = [
    { value: ReservationStatus.Pending, label: 'Pendiente' },
    { value: ReservationStatus.Confirmed, label: 'Confirmada' },
    { value: ReservationStatus.Completed, label: 'Completada' },
    { value: ReservationStatus.Cancelled, label: 'Cancelada' },
    { value: ReservationStatus.NoShow, label: 'No se presentó' },
  ];

  ngOnInit(): void { this.loadReservations(); }

  loadReservations(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { pageNumber: this.page, pageSize: 15 };
    if (this.dateFrom) params['dateFrom'] = this.dateFrom;
    if (this.dateTo) params['dateTo'] = this.dateTo;
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.api.getPaged<Reservation>('reservations', params).subscribe({
      next: data => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  changePage(p: number): void { this.page = p; this.loadReservations(); }

  confirm(id: string): void {
    this.api.patch(`reservations/${id}/confirm`).subscribe({
      next: () => { this.toast.success('Reserva confirmada'); this.loadReservations(); }
    });
  }

  cancel(id: string): void {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    this.api.patch(`reservations/${id}/cancel`, { reason }).subscribe({
      next: () => { this.toast.warning('Reserva cancelada'); this.loadReservations(); }
    });
  }

  complete(id: string): void {
    this.api.patch(`reservations/${id}/complete`).subscribe({
      next: () => { this.toast.success('Reserva completada'); this.loadReservations(); }
    });
  }
}
