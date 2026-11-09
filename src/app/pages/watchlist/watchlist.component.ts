import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDatabase } from '../../services/app-database.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watchlist.component.html'
})
export class WatchlistComponent {
  private db = inject(AppDatabase);

  // Tu pourras lier ici tes signaux Dexie pour récupérer la table watchlist
}