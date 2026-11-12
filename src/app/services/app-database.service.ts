import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import Dexie, { Table } from 'dexie';

import { Trade } from '../models/trade.model';
import { Setup } from '../models/setup.model';
import { TradeGroup } from '../models/trade-group.model';
import { LexiconItem } from '../models/lexicon.model';
import { WatchlistItem } from '../models/watchlist.model';
import { Dividend } from '../models/dividend.model';
import { PairNote } from '../models/pair-analysis.model';
import { isPlatformBrowser } from '@angular/common';
import { Setting } from '../models/setting.model';

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
  settings!: Table<Setting, string>;

  constructor() {
    super('PaperTradingDB');

    // On ne configure la base que si on est dans le navigateur pour éviter les erreurs SSR
    if (isPlatformBrowser(this.platformId)) {
      // Schema and indexing definition (++id = auto-increment primary key)
      this.version(4).stores({
        trades: 'id, pair, date, entryPrice, exitPrice, mode, setupId, groupId, isBacktest',
        setups: 'id, name',
        tradeGroups: 'id, name',
        lexicon: 'id, category, title, content, images, updatedAt',
        watchlist: 'id, pair, status',
        dividends: 'id, asset, paymentDate',
        pairNotes: 'id, pair, date',
        settings: 'key'
      });
    }
  }

  async getTrades(): Promise<Trade[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return []; // Retourne un tableau vide côté serveur
    }
    return await this.trades.toArray();
  }

  public async exportDatabaseBlob(): Promise<Blob | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    const { exportDB } = await import('dexie-export-import');
    return await exportDB(this);
  }

  public async importDatabaseBlob(file: File): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const { importInto } = await import('dexie-export-import');
    await importInto(this, file, { clearTablesBeforeImport: true });
  }
  
  public async updateAvailableCash(amount: number): Promise<void> {
  await this.settings.put({ key: 'availableCash', value: amount });
}

public async getAvailableCash(): Promise<number> {
  const record = await this.settings.get('availableCash');
  return record ? record.value : 0;
}
}