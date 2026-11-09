import { Component, signal } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  standalone: true,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
