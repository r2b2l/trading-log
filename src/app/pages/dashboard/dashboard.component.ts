import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDatabase } from '../../services/app-database.service';
import { Trade } from '../../models/trade.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  isIncognito = signal<boolean>(false);
  private db = inject(AppDatabase);
  private cdr = inject(ChangeDetectorRef);

  // Récupération réactive de tous les trades depuis Dexie sous forme de Signal
  trades = signal<Trade[]>([]);

  // Calcul dynamique du PnL global
  totalPnl = computed(() => {
    return this.trades().reduce((acc, trade) => acc + (trade.pnl ?? 0), 0);
  });

  // Calcul du taux de réussite (Win Rate) en %
  winRate = computed<number>(() => {
    const allTrades = this.trades();
    const closedTrades = allTrades.filter(t => t.pnl !== undefined && t.pnl !== null);
    if (closedTrades.length === 0) return 0;

    const winningTrades = closedTrades.filter(t => (t.pnl ?? 0) > 0);
    return Math.round((winningTrades.length / closedTrades.length) * 100);
  });

  // Calcul du nombre de trades gagnants et perdants
  winningTradesCount = computed<number>(() => {
    return this.trades().filter(t => (t.pnl ?? 0) > 0).length;
  });

  // Calcul du nombre de trades perdants
  losingTradesCount = computed<number>(() => {
    return this.trades().filter(t => (t.pnl ?? 0) < 0).length;
  });

  // Calcul du Profit Factor
  profitFactor = computed<number>(() => {
    const allTrades = this.trades();
    const closedTrades = allTrades.filter(t => t.pnl !== undefined && t.pnl !== null);
    if (closedTrades.length === 0) return 0;

    const totalProfit = closedTrades
      .filter(t => (t.pnl ?? 0) > 0)
      .reduce((acc, trade) => acc + (trade.pnl ?? 0), 0);

    const totalLoss = closedTrades
      .filter(t => (t.pnl ?? 0) < 0)
      .reduce((acc, trade) => acc + Math.abs(trade.pnl ?? 0), 0);

    return totalLoss === 0 ? Infinity : totalProfit / totalLoss;
  });

  // Les 5 derniers trades enregistrés (triés par date décroissante)
  recentTrades = computed<Trade[]>(() => {
    return [...this.trades()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  });

  async ngOnInit(): Promise<void> {
    await this.loadTrades();
  }

  // Méthode pour charger ou rafraîchir les données depuis Dexie
  async loadTrades(): Promise<void> {
    try {
      const data = await this.db.getTrades();
      console.log('Trades chargés depuis Dexie :', data);
      this.trades.set(data);
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Erreur lors du chargement des trades :', error);
    }
  }

  toggleIncognito(): void {
    this.isIncognito.update(v => !v);
  }
}