import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardStats } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly exporting = signal<'excel' | 'pdf' | null>(null);
  readonly stats = signal<DashboardStats | null>(null);

  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  readonly years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  readonly months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.loading.set(true);
    this.api.get<DashboardStats>('dashboard/stats', { year: this.year, month: this.month }).subscribe({
      next: data => { this.stats.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  exportExcel(): void { this.exportReport('excel'); }
  exportPdf(): void { this.exportReport('pdf'); }

  private exportReport(format: 'excel' | 'pdf'): void {
    if (this.exporting()) return;
    this.exporting.set(format);

    this.api.getBlob(`reports/sales/export/${format}`, { year: this.year, month: this.month }).subscribe({
      next: blob => {
        const extension = format === 'excel' ? 'xlsx' : 'pdf';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte-ventas-${this.year}-${String(this.month).padStart(2, '0')}.${extension}`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.exporting.set(null);
      },
      error: () => {
        this.exporting.set(null);
        this.toast.error('No se pudo generar el reporte');
      }
    });
  }
}
