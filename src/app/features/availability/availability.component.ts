import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AvailabilityService } from '../../core/services/availability.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import {
  BarberAvailabilityBlock,
  BarberMonthAvailability,
  AvailableDay,
  BarberSummary
} from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

interface BarberProfile { id: string; fullName: string; }

@Component({
  selector: 'app-availability',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.scss'
})
export class AvailabilityComponent implements OnInit {
  private readonly availabilityService = inject(AvailabilityService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly isAdmin = this.auth.isAdmin;
  readonly isBarber = this.auth.isBarber;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<string | null>(null);

  readonly barbers = signal<BarberSummary[]>([]);
  readonly activeBarberId = signal<string>('');
  readonly activeBarberName = signal<string>('');

  readonly currentYear = signal(new Date().getFullYear());
  readonly currentMonth = signal(new Date().getMonth() + 1);
  readonly monthAvailability = signal<BarberMonthAvailability | null>(null);

  readonly showModal = signal(false);
  readonly editingBlock = signal<BarberAvailabilityBlock | null>(null);
  readonly modalDate = signal<string>('');
  readonly showShrinkModal = signal(false);
  readonly shrinkingBlock = signal<BarberAvailabilityBlock | null>(null);
  readonly showConfirmDelete = signal<string | null>(null);

  readonly monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth() - 1, 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  readonly calendarWeeks = computed(() => this.buildCalendarWeeks());

  readonly blockForm = this.fb.group({
    startTime: ['08:00', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    endTime: ['12:00', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    note: ['']
  });

  readonly shrinkForm = this.fb.group({
    newEndTime: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]]
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
          this.loadMonth();
        },
        error: () => this.toast.error('No se pudo cargar tu perfil de barbero')
      });
    }
  }

  selectBarber(barberId: string): void {
    this.activeBarberId.set(barberId);
    const found = this.barbers().find(b => b.id === barberId);
    this.activeBarberName.set(found?.fullName ?? '');
    if (barberId) this.loadMonth();
    else this.monthAvailability.set(null);
  }

  loadMonth(): void {
    const barberId = this.activeBarberId();
    if (!barberId) return;

    this.loading.set(true);
    this.availabilityService.getByMonth(barberId, this.currentYear(), this.currentMonth()).subscribe({
      next: data => { this.monthAvailability.set(data); this.loading.set(false); },
      error: () => { this.monthAvailability.set(null); this.loading.set(false); }
    });
  }

  prevMonth(): void {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.loadMonth();
  }

  nextMonth(): void {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.loadMonth();
  }

  getBlocksForDate(dateStr: string): BarberAvailabilityBlock[] {
    return this.monthAvailability()?.days.find(d => d.date === dateStr)?.blocks ?? [];
  }

  openAddModal(dateStr: string): void {
    this.editingBlock.set(null);
    this.modalDate.set(dateStr);
    this.blockForm.reset({ startTime: '08:00', endTime: '12:00', note: '' });
    this.showModal.set(true);
  }

  openEditModal(block: BarberAvailabilityBlock): void {
    this.editingBlock.set(block);
    this.modalDate.set(block.date);
    this.blockForm.reset({
      startTime: block.startTime.substring(0, 5),
      endTime: block.endTime.substring(0, 5),
      note: block.note ?? ''
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingBlock.set(null);
    this.modalDate.set('');
  }

  saveBlock(): void {
    if (this.blockForm.invalid) return;
    const barberId = this.activeBarberId();
    if (!barberId) return;

    const v = this.blockForm.value;
    this.saving.set(true);

    const existing = this.editingBlock();
    if (existing) {
      this.availabilityService.update(existing.id, {
        startTime: v.startTime!,
        endTime: v.endTime!,
        note: v.note || undefined
      }).subscribe({
        next: () => { this.saving.set(false); this.toast.success('Bloque actualizado'); this.closeModal(); this.loadMonth(); },
        error: (err) => { this.saving.set(false); this.toast.error(err.error?.message ?? 'Error al actualizar'); }
      });
    } else {
      this.availabilityService.create({
        barberId,
        date: this.modalDate(),
        startTime: v.startTime!,
        endTime: v.endTime!,
        note: v.note || undefined
      }).subscribe({
        next: () => { this.saving.set(false); this.toast.success('Disponibilidad agregada'); this.closeModal(); this.loadMonth(); },
        error: (err) => { this.saving.set(false); this.toast.error(err.error?.message ?? 'Error al guardar'); }
      });
    }
  }

  openShrinkModal(block: BarberAvailabilityBlock): void {
    this.shrinkingBlock.set(block);
    this.shrinkForm.reset({ newEndTime: block.endTime.substring(0, 5) });
    this.showShrinkModal.set(true);
  }

  closeShrinkModal(): void {
    this.showShrinkModal.set(false);
    this.shrinkingBlock.set(null);
  }

  confirmShrink(): void {
    const block = this.shrinkingBlock();
    if (!block || this.shrinkForm.invalid) return;
    this.saving.set(true);

    this.availabilityService.shrink(block.id, { newEndTime: this.shrinkForm.value.newEndTime! }).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Horario recortado'); this.closeShrinkModal(); this.loadMonth(); },
      error: (err) => { this.saving.set(false); this.toast.error(err.error?.message ?? 'Error al recortar'); }
    });
  }

  confirmDelete(blockId: string): void {
    this.showConfirmDelete.set(blockId);
  }

  cancelDelete(): void {
    this.showConfirmDelete.set(null);
  }

  deleteBlock(blockId: string): void {
    this.deleting.set(blockId);
    this.showConfirmDelete.set(null);

    this.availabilityService.delete(blockId).subscribe({
      next: () => { this.deleting.set(null); this.toast.success('Bloque eliminado'); this.loadMonth(); },
      error: (err) => { this.deleting.set(null); this.toast.error(err.error?.message ?? 'Error al eliminar'); }
    });
  }

  private buildCalendarWeeks(): { dateStr: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean }[][] {
    const year = this.currentYear();
    const month = this.currentMonth();
    const today = new Date();

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let startDow = firstDay.getDay();
    if (startDow === 0) startDow = 7;

    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean }[] = [];

    for (let i = startDow - 1; i > 0; i--) {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - i);
      cells.push({ dateStr: this.toDateStr(d), dayNum: d.getDate(), isCurrentMonth: false, isPast: true });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      cells.push({ dateStr: this.toDateStr(date), dayNum: d, isCurrentMonth: true, isPast });
    }

    while (cells.length % 7 !== 0) {
      const last = new Date(lastDay);
      last.setDate(last.getDate() + (cells.length - lastDay.getDate() + 1 - startDow + 1));
      cells.push({ dateStr: this.toDateStr(last), dayNum: last.getDate(), isCurrentMonth: false, isPast: true });
    }

    const weeks: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
