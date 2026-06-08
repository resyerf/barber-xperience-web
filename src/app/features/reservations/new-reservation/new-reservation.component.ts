import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BarberSummary, Service } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-new-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSpinnerComponent, AvatarComponent],
  templateUrl: './new-reservation.component.html',
  styleUrl: './new-reservation.component.scss'
})
export class NewReservationComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly currentStep = signal(1);
  readonly loadingServices = signal(true);
  readonly submitting = signal(false);
  readonly services = signal<Service[]>([]);
  readonly barbers = signal<BarberSummary[]>([]);
  readonly selectedServiceId = signal<string | null>(null);
  readonly selectedBarberId = signal<string | null>(null);
  readonly selectedDate = signal('');
  readonly selectedTime = signal('');
  notes = '';

  readonly minDate = new Date().toISOString().split('T')[0];

  readonly steps = [
    { num: 1, label: 'Servicio', icon: 'bi-list-stars' },
    { num: 2, label: 'Barbero', icon: 'bi-scissors' },
    { num: 3, label: 'Fecha', icon: 'bi-calendar3' },
    { num: 4, label: 'Confirmar', icon: 'bi-check-circle' }
  ];

  readonly timeSlots: string[] = Array.from({ length: 28 }, (_, i) => {
    const totalMinutes = 8 * 60 + i * 30;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.api.getPaged<Service>('services', { isActive: true, pageSize: 50 }).subscribe({
      next: data => { this.services.set(data.items); this.loadingServices.set(false); }
    });
    this.api.getPaged<BarberSummary>('barbers', { isActive: true, pageSize: 50 }).subscribe({
      next: data => this.barbers.set(data.items)
    });
  }

  selectService(service: Service): void { this.selectedServiceId.set(service.id); }
  onDateChange(e: Event): void { this.selectedDate.set((e.target as HTMLInputElement).value); }
  onTimeChange(e: Event): void { this.selectedTime.set((e.target as HTMLSelectElement).value); }

  getSelectedServiceName(): string { return this.services().find(s => s.id === this.selectedServiceId())?.name ?? ''; }
  getSelectedBarberName(): string { return this.barbers().find(b => b.id === this.selectedBarberId())?.fullName ?? ''; }
  getSelectedServicePrice(): number { return this.services().find(s => s.id === this.selectedServiceId())?.price ?? 0; }

  submit(): void {
    this.submitting.set(true);
    const [h, m] = this.selectedTime().split(':').map(Number);
    const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

    this.api.post('reservations', {
      clientId: this.auth.currentUser()?.userId,
      barberId: this.selectedBarberId(),
      serviceId: this.selectedServiceId(),
      reservationDate: this.selectedDate(),
      startTime,
      notes: this.notes
    }).subscribe({
      next: () => {
        this.toast.success('¡Reserva creada exitosamente!');
        this.router.navigate(['/reservations']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
