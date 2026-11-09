import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AppDatabase } from '../../services/app-database.service';
import { TradeMode } from '../../models/trade.model';

@Component({
  selector: 'app-trade-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trade-form.component.html'
})
export class TradeFormComponent implements OnInit {
  private db = inject(AppDatabase);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // État du formulaire
  tradeId = signal<string | null>(null);
  isEditMode = signal<boolean>(false);

  // Champs du modèle
  pair: string = '';
  mode: TradeMode = 'paper';
  entryPrice: number | null = null;
  exitPrice: number | null = null;
  pnl: number | null = null;
  date: string = new Date().toISOString().slice(0, 16);
  notes: string = '';

  async ngOnInit(): Promise<void> {

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      return;
    }

    this.tradeId.set(idParam);
    this.isEditMode.set(true);

    try {
      const existingTrade = await this.db.trades.get(idParam);

      if (!existingTrade) {
        console.error('Aucun trade trouvé pour cet ID :', idParam);
        return;
      }

      this.pair = existingTrade.pair;
      this.mode = existingTrade.mode;
      this.entryPrice = existingTrade.entryPrice;
      this.exitPrice = existingTrade.exitPrice ?? null;
      this.pnl = existingTrade.pnl ?? null;
      this.date = existingTrade.date;
      this.notes = existingTrade.notes ?? '';

      this.cdr.markForCheck();

    } catch (error) {
      console.error('Erreur lors du chargement du trade :', error);
    }
  }

  async saveTrade(event: Event) {
    event.preventDefault();

    if (!this.pair || this.entryPrice === null) {
      alert('Veuillez remplir au moins la paire et le prix d\'entrée.');
      return;
    }

    try {
      if (this.isEditMode() && this.tradeId() !== null) {
        // Mode Mise à jour (Update)
        await this.db.trades.update(this.tradeId()!, {
          pair: this.pair.toUpperCase(),
          mode: this.mode,
          entryPrice: Number(this.entryPrice),
          exitPrice: this.exitPrice !== null ? Number(this.exitPrice) : undefined,
          pnl: this.pnl !== null ? Number(this.pnl) : undefined,
          date: this.date,
          notes: this.notes
        });
      } else {
        // Mode Création (Add)
        await this.db.trades.add({
          id: crypto.randomUUID(),
          pair: this.pair.toUpperCase(),
          mode: this.mode,
          entryPrice: Number(this.entryPrice),
          exitPrice: this.exitPrice !== null ? Number(this.exitPrice) : undefined,
          pnl: this.pnl !== null ? Number(this.pnl) : undefined,
          date: this.date,
          notes: this.notes,
          createdAt: new Date().toISOString()
        });
      }

      this.router.navigate(['/trades']);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du trade :', error);
      alert('Une erreur est survenue.');
    }
  }
}