import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';

import { AppDatabase } from '../../services/app-database.service';
import { Trade, TradeMode } from '../../models/trade.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trades-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trades-list.component.html'
})
export class TradesListComponent {
  private db = inject(AppDatabase);

  // Filtres réactifs
  selectedMode = signal<TradeMode | 'all'>('all');
  searchQuery = signal<string>('');

  // Récupération réactive en temps réel depuis IndexedDB (Dexie)
  private rawTrades$ = liveQuery(() => this.db.trades.orderBy('date').reverse().toArray());
  trades = toSignal<Trade[]>(this.rawTrades$);

  // Trades filtrés dynamiquement avec un Signal computed
  filteredTrades = computed(() => {
    const list = this.trades() ?? [];
    const mode = this.selectedMode();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter((trade: Trade) => {
      const matchMode = mode === 'all' || trade.mode === mode;
      const matchQuery = !query || trade.pair.toLowerCase().includes(query);
      return matchMode && matchQuery;
    });
  });

  // Suppression d'un trade
  async deleteTrade(id?: string) {
    if (!id) return;
    if (confirm('Es-tu sûr de vouloir supprimer ce trade ?')) {
      await this.db.trades.delete(id);
    }
  }
}