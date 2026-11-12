import { ChangeDetectorRef, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppDatabase } from '../../services/app-database.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html'
})
export class SettingsComponent {
  private readonly db = inject(AppDatabase);
  private readonly cdr = inject(ChangeDetectorRef);

  public availableCash = signal<number>(0);
  public isModalOpen = signal<boolean>(false);
  public tempCashValue = signal<number>(0);

  public readonly isExporting = signal<boolean>(false);
  public readonly isImporting = signal<boolean>(false);
  public readonly statusMessage = signal<{ text: string; isError: boolean } | null>(null);

  public async ngOnInit(): Promise<void> {
    await this.loadAvailableCash();
  }

  public async loadAvailableCash(): Promise<void> {
    try {
      const cash = await this.db.getAvailableCash();
      this.availableCash.set(cash);
    } catch (error) {
      console.error('Erreur lors du chargement du cashflow :', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  public openCashModal(): void {
    this.tempCashValue.set(this.availableCash());
    this.isModalOpen.set(true);
    this.cdr.markForCheck();
  }

  public closeCashModal(): void {
    this.isModalOpen.set(false);
    this.cdr.markForCheck();
  }

  public async saveCashflow(): Promise<void> {
    try {
      const newAmount = Number(this.tempCashValue()) || 0;
      await this.db.updateAvailableCash(newAmount);
      this.availableCash.set(newAmount);
      this.closeCashModal();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cashflow :', error);
    }
  }

  /**
   * Exporte la base de données Dexie au format JSON
   */
  public async exportData(): Promise<void> {
    this.isExporting.set(true);
    this.statusMessage.set(null);

    try {
      const blob: Blob | null = await this.db.exportDatabaseBlob();
      if (!blob) throw new Error('Export indisponible côté serveur.');

      const url: string = URL.createObjectURL(blob);
      const anchor: HTMLAnchorElement = document.createElement('a');
      const dateStr: string = new Date().toISOString().slice(0, 10);
      
      anchor.href = url;
      anchor.download = `trading-log-backup-${dateStr}.json`;
      anchor.click();
      URL.revokeObjectURL(url);

      this.statusMessage.set({ text: 'Sauvegarde exportée avec succès !', isError: false });
    } catch (error: unknown) {
      console.error('Erreur lors de l\'export :', error);
      this.statusMessage.set({ text: 'Échec de l\'exportation de la base.', isError: true });
    } finally {
      this.isExporting.set(false);
      this.cdr.markForCheck();
    }
  }

  /**
   * Gestion de la sélection du fichier JSON et import
   */
  public async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];
    if (!file.name.endsWith('.json')) {
      this.statusMessage.set({ text: 'Veuillez sélectionner un fichier JSON valide.', isError: true });
      return;
    }

    if (!confirm('Attention : l\'importation remplacera toutes les données actuelles. Continuer ?')) {
      input.value = ''; // Reset input
      return;
    }

    this.isImporting.set(true);
    this.statusMessage.set(null);

    try {
      await this.db.importDatabaseBlob(file);
      this.statusMessage.set({ text: 'Données importées avec succès !', isError: false });
    } catch (error: unknown) {
      console.error('Erreur lors de l\'import :', error);
      this.statusMessage.set({ text: 'Échec de l\'importation du fichier JSON.', isError: true });
    } finally {
      this.isImporting.set(false);
      input.value = ''; // Reset input
      this.cdr.markForCheck();
    }
  }
}