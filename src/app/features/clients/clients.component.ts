import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ClientDto, PagedResult } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, AvatarComponent, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly result = signal<PagedResult<ClientDto> | null>(null);
  search = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void { this.loadClients(); }

  loadClients(): void {
    this.loading.set(true);
    const params: Record<string, unknown> = { pageSize: 20 };
    if (this.search) params['search'] = this.search;
    this.api.getPaged<ClientDto>('clients', params).subscribe({
      next: data => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadClients(), 400);
  }
}
