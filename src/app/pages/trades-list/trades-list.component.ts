import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';

import { AppDatabase } from '../../services/app-database.service';
import { Trade, TradeMode } from '../../models/trade.model';
import { RouterLink } from '@angular/router';

// Définition du type pour le filtre de statut des trades
type TradeStatusFilter = 'all' | 'winning' | 'losing' | 'ongoing';

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
  selectedStatus = signal<TradeStatusFilter>('all');
  searchQuery = signal<string>('');

  // Récupération réactive en temps réel depuis IndexedDB (Dexie)
  private rawTrades$ = liveQuery(() => this.db.trades.orderBy('date').reverse().toArray());
  trades = toSignal<Trade[]>(this.rawTrades$);

  // Trades filtrés dynamiquement avec un Signal computed
  filteredTrades = computed(() => {
    const list = this.trades() ?? [];
    const mode = this.selectedMode();
    const status = this.selectedStatus();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter((trade: Trade) => {
      // 1. Filtre par mode
      const matchMode = mode === 'all' || trade.mode === mode;
      
      // 2. Filtre par recherche textuelle (Paire)
      const matchQuery = !query || trade.pair.toLowerCase().includes(query);

      // 3. Filtre par statut (Gagnant, Perdant, En cours)
      let matchStatus = true;
      const pnl = trade.pnl;
      const isClosed = pnl !== undefined && pnl !== null;

      if (status === 'winning') {
        matchStatus = isClosed && pnl > 0;
      } else if (status === 'losing') {
        matchStatus = isClosed && pnl < 0;
      } else if (status === 'ongoing') {
        matchStatus = !isClosed;
      }

      return matchMode && matchQuery && matchStatus;
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