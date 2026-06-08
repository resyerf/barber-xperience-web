import { ChangeDetectionStrategy, Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkSchedule, BarberSummary } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface BarberProfile { id: string; fullName: string; }

@Component({
  selector: 'app-schedules',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './schedules.component.html'
})
export class SchedulesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly isAdmin = this.auth.isAdmin;
  readonly isBarber = this.auth.isBarber;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly barbers = signal<BarberSummary[]>([]);
  readonly schedules = signal<WorkSchedule[]>([]);
  readonly activeBarberId = signal<string>('');
  readonly activeBarberName = signal<string>('');
  readonly showModal = signal(false);
  readonly editingDay = signal<{ index: number; label: string } | null>(null);

  readonly dayNames = [
    { index: 1, label: 'Lunes' }, { index: 2, label: 'Martes' },
    { index: 3, label: 'Miércoles' }, { index: 4, label: 'Jueves' },
    { index: 5, label: 'Viernes' }, { index: 6, label: 'Sábado' },
    { index: 0, label: 'Domingo' }
  ];

  readonly scheduleForm = this.fb.group({
    isWorkingDay: [true],
    startTime: ['08:00', Validators.required],
    endTime: ['18:00', Validators.required],
    hasBreak: [false],
    breakStart: ['12:00'],
    breakEnd: ['13:00'],
    slotDurationMinutes: [30, [Validators.required, Validators.min(15), Validators.max(120)]]
  });

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.api.getPaged<BarberSummary>('barbers', { isActive: true, pageSize: 50 }).subscribe({
        next: data => this.barbers.set(data.items)
      });
    } else if (this.isBarber()) {
      this.api.get<BarberProfile>('barbers/my-profile').subscribe({
        next: profile => {
          this.activeBarberId.set(profile.id);
          this.activeBarberName.set(profile.fullName);
          this.loadSchedule(profile.id);
        },
        error: () => this.toast.error('No se pudo cargar tu perfil de barbero')
      });
    }
  }

  selectBarber(barberId: string): void {
    this.activeBarberId.set(barberId);
    const found = this.barbers().find(b => b.id === barberId);
    this.activeBarberName.set(found?.fullName ?? '');
    if (barberId) this.loadSchedule(barberId);
    else this.schedules.set([]);
  }

  loadSchedule(barberId: string): void {
    this.loading.set(true);
    this.api.get<WorkSchedule[]>(`schedules/barber/${barberId}`).subscribe({
      next: data => { this.schedules.set(Array.isArray(data) ? data : []); this.loading.set(false); },
      error: () => { this.schedules.set([]); this.loading.set(false); }
    });
  }

  getScheduleForDay(dayIndex: number): WorkSchedule | undefined {
    return this.schedules().find(s => s.dayOfWeek === dayIndex);
  }

  openEditModal(day: { index: number; label: string }): void {
    const existing = this.getScheduleForDay(day.index);
    this.editingDay.set(day);

    this.scheduleForm.reset({
      isWorkingDay: existing?.isWorkingDay ?? true,
      startTime: existing?.startTime?.substring(0, 5) ?? '08:00',
      endTime: existing?.endTime?.substring(0, 5) ?? '18:00',
      hasBreak: !!existing?.breakStart,
      breakStart: existing?.breakStart?.substring(0, 5) ?? '12:00',
      breakEnd: existing?.breakEnd?.substring(0, 5) ?? '13:00',
      slotDurationMinutes: existing?.slotDurationMinutes ?? 30
    });

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingDay.set(null);
  }

  saveSchedule(): void {
    const day = this.editingDay();
    const barberId = this.activeBarberId();
    if (!day || !barberId) return;

    this.saving.set(true);
    const v = this.scheduleForm.value;

    const body = {
      barberId,
      dayOfWeek: day.index,
      isWorkingDay: v.isWorkingDay,
      startTime: v.startTime,
      endTime: v.endTime,
      breakStart: v.hasBreak ? v.breakStart : null,
      breakEnd: v.hasBreak ? v.breakEnd : null,
      slotDurationMinutes: v.slotDurationMinutes
    };

    this.api.put<WorkSchedule>('schedules', body).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.toast.success(`Horario del ${day.label} actualizado`);
        this.closeModal();
        this.loadSchedule(barberId);
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err.error?.message ?? 'Error al guardar el horario');
      }
    });
  }
}
