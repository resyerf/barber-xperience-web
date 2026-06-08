import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  readonly icon = input<string>('bi-inbox');
  readonly message = input<string>('No se encontraron resultados');
}
