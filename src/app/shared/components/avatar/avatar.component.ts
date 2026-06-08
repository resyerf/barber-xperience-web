import { Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  readonly initials = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
