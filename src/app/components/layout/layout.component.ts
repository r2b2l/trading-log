import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  // État rétractable de la sidebar (false = ouverte, true = repliée)
  isCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }
}