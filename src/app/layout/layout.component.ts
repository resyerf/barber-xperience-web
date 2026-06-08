import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { ToastContainerComponent } from '../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {}
