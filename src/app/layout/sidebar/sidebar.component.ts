import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  readonly userRole = this.auth.userRole;

  readonly mainNav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill', roles: ['Admin'] },
    { path: '/reservations', label: 'Reservas', icon: 'bi-calendar-check' },
    { path: '/reservations/new', label: 'Nueva Reserva', icon: 'bi-calendar-plus', roles: ['Client'] },
  ];

  readonly mgmtNav: NavItem[] = [
    { path: '/barbers', label: 'Barberos', icon: 'bi-scissors', roles: ['Admin'] },
    { path: '/services', label: 'Servicios', icon: 'bi-list-stars', roles: ['Admin'] },
    { path: '/categories', label: 'Categorías', icon: 'bi-tags', roles: ['Admin'] },
    { path: '/packages', label: 'Paquetes', icon: 'bi-box-seam', roles: ['Admin'] },
    { path: '/schedules', label: 'Horarios', icon: 'bi-clock', roles: ['Admin', 'Barber'] },
    { path: '/availability', label: 'Mi Disponibilidad', icon: 'bi-calendar3', roles: ['Admin', 'Barber'] },
    { path: '/clients', label: 'Clientes', icon: 'bi-people', roles: ['Admin', 'Barber'] },
    { path: '/reports', label: 'Reportes', icon: 'bi-bar-chart-line', roles: ['Admin'] },
  ];

  logout(): void { this.auth.logout(); }
}
