import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import Dexie, { Table } from 'dexie';
// import { exportDB } from 'dexie-export-import';

import { Trade } from '../models/trade.model';
import { Setup } from '../models/setup.model';
import { TradeGroup } from '../models/trade-group.model';
import { LexiconItem } from '../models/lexicon.model';
import { WatchlistItem } from '../models/watchlist.model';
import { Dividend } from '../models/dividend.model';
import { PairNote } from '../models/pair-analysis.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AppDatabase extends Dexie {
  private platformId = inject(PLATFORM_ID);
  trades!: Table<Trade, string>;
  setups!: Table<Setup, string>;
  tradeGroups!: Table<TradeGroup, string>;
  lexicon!: Table<LexiconItem, string>;
  watchlist!: Table<WatchlistItem, string>;
  dividends!: Table<Dividend, string>;
  pairNotes!: Table<PairNote, string>;

  constructor() {
    super('PaperTradingDB');

    // On ne configure la base que si on est dans le navigateur pour éviter les erreurs SSR
    if (isPlatformBrowser(this.platformId)) {
      // Schema and indexing definition (++id = auto-increment primary key)
      this.version(2).stores({
        trades: 'id, pair, date, mode, setupId, groupId, isBacktest',
        setups: 'id, name',
        tradeGroups: 'id, name',
        lexicon: 'id, category, title',
        watchlist: 'id, pair, status',
        dividends: 'id, asset, paymentDate',
        pairNotes: 'id, pair, date'
      });
    }
  }

  async getTrades(): Promise<Trade[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return []; // Retourne un tableau vide côté serveur
    }
    return await this.trades.toArray();
  }

  // Méthode sécurisée pour l'export
  async exportDb(): Promise<Blob | null> {
    if (!isPlatformBrowser(this.platformId)) return null;

    await import('dexie-export-import');
    return await this.export();
  }
}