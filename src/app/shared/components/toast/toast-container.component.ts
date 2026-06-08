import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      success: 'bi bi-check-circle-fill text-success',
      error: 'bi bi-exclamation-circle-fill text-danger',
      warning: 'bi bi-exclamation-triangle-fill text-warning',
      info: 'bi bi-info-circle-fill text-info'
    };
    return icons[type] ?? 'bi bi-info-circle-fill';
  }
}
