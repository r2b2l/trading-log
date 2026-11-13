import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';

import { AppDatabase } from '../../services/app-database.service';
import { Trade, TradeMode } from '../../models/trade.model';
import { RouterLink } from '@angular/router';

// Définition du type pour le filtre de statut des trades
type TradeStatusFilter = 'all' | 'winning' | 'losing' | 'ongoing';
export type SortColumn = 'date' | 'pair' | 'mode' | 'entryPrice' | 'exitPrice' | 'pnl';
export type SortDirection = 'asc' | 'desc';

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

  // État du tri (par défaut : date la plus récente en premier)
  sortColumn = signal<SortColumn>('date');
  sortDirection = signal<SortDirection>('desc');

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

  sortedTrades = computed(() => {
    const list = [...this.filteredTrades()];
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    return list.sort((a, b) => {
      switch (col) {
        case 'date':
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;

        case 'pair':
        case 'mode':
          return a[col].localeCompare(b[col]) * dir;

        case 'entryPrice':
          return (a.entryPrice - b.entryPrice) * dir;

        case 'exitPrice':
        case 'pnl': {
          // Place toujours les trades "En cours" (null/undefined) à la fin du tableau
          const valA = a[col];
          const valB = b[col];
          if (valA == null && valB == null) return 0;
          if (valA == null) return 1;
          if (valB == null) return -1;
          return (valA - valB) * dir;
        }

        default:
          return 0;
      }
    });
  });

  // Gestion du clic sur un en-tête de colonne
  toggleSort(column: SortColumn): void {
    console.log(`Tri par colonne : ${column}`);
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      // Tri décroissant par défaut pour les montants et dates, croissant pour le texte
      this.sortDirection.set(column === 'pair' || column === 'mode' ? 'asc' : 'desc');
    }
  }

  // Suppression d'un trade
  async deleteTrade(id?: string) {
    if (!id) return;
    if (confirm('Es-tu sûr de vouloir supprimer ce trade ?')) {
      await this.db.trades.delete(id);
    }
  }
}