import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardStats } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PageHeaderComponent, StatCardComponent, AvatarComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStats | null>(null);
  readonly error = signal<string | null>(null);
  readonly isAdmin = this.auth.isAdmin;
  readonly today = new Date();

  ngOnInit(): void {
    if (!this.isAdmin()) {
      this.loading.set(false);
      return;
    }

    const now = new Date();
    this.api.get<DashboardStats>('dashboard/stats', { year: now.getFullYear(), month: now.getMonth() + 1 }).subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.status === 403 ? 'Sin permisos para ver el dashboard.' : 'Error al cargar los datos.');
        this.loading.set(false);
      }
    });
  }
}
