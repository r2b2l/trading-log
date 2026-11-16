import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';

import { AppDatabase } from '../../services/app-database.service';
import { WatchlistItem, WatchlistStatus } from '../../models/watchlist.model';

export interface EnrichedWatchlistItem extends WatchlistItem {
  latestNote?: string;
  latestDate?: string;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './watchlist.component.html'
})
export class WatchlistComponent {
  private db = inject(AppDatabase);

  // Champs du formulaire d'ajout rapide
  newPair = signal<string>('');
  newReason = signal<string>('');
  newStatus = signal<WatchlistStatus>('pending');

  // Filtres
  selectedStatus = signal<WatchlistStatus | 'all'>('all');
  searchQuery = signal<string>('');

  // Flux temps réel Dexie (Watchlist + PairNotes)
  private watchlist$ = liveQuery(() => this.db.watchlist.toArray());
  private pairNotes$ = liveQuery(() => this.db.pairNotes.toArray());

  items = toSignal<WatchlistItem[]>(this.watchlist$);
  notes = toSignal<{ pair: string; date: string; note: string }[]>(this.pairNotes$);

  // Fusion des éléments de la watchlist avec leur dernière note associée et filtrage
  filteredItems = computed<EnrichedWatchlistItem[]>(() => {
    const statusOrder: Record<WatchlistStatus, number> = {
      active: 1,
      pending: 2,
      watching: 3,
      archived: 4
    };

    const statusFilter = this.selectedStatus();
    const query = this.searchQuery().toLowerCase().trim();
    const allNotes = this.notes() ?? [];

    return (this.items() ?? [])
      .map(item => {
        // Récupère la note la plus récente pour cette paire
        const pairNotes = allNotes
          .filter(n => n.pair.toUpperCase() === item.pair.toUpperCase())
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          ...item,
          latestNote: pairNotes[0]?.note,
          latestDate: pairNotes[0]?.date
        };
      })
      .filter(item => {
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchQuery =
          !query ||
          item.pair.toLowerCase().includes(query) ||
          (item.latestNote?.toLowerCase().includes(query) ?? false);
        return matchStatus && matchQuery;
      })
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  });

  // Ajout dans watchlist + création de la note associée dans pairNotes
  async addItem(): Promise<void> {
    const pair = this.newPair().trim().toUpperCase();
    const reason = this.newReason().trim();
    if (!pair) return;

    const existing = (this.items() ?? []).find(i => i.pair.toUpperCase() === pair);

    if (!existing) {
      await this.db.watchlist.add({
        id: crypto.randomUUID(),
        pair,
        status: this.newStatus(),
        reason,
        createdAt: new Date().toISOString()
      });
    } else if (existing.id) {
      await this.db.watchlist.update(existing.id, { status: this.newStatus() });
    }

    if (reason) {
      await this.db.pairNotes.add({
        id: crypto.randomUUID(),
        pair,
        date: new Date().toISOString().slice(0, 16),
        note: reason
      });
    }

    this.newPair.set('');
    this.newReason.set('');
  }

  // Changement de statut directement depuis la carte
  async updateStatus(id: string, status: WatchlistStatus): Promise<void> {
    await this.db.watchlist.update(id, { status });
  }

  // Suppression de l'élément
  async deleteItem(id: string, pair: string): Promise<void> {
    if (confirm(`Retirer ${pair} de la watchlist ?`)) {
      await this.db.watchlist.delete(id);
    }
  }
}