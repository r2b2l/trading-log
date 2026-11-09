import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppDatabase } from '../../services/app-database.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html'
})
export class SettingsComponent {
  private platformId = inject(PLATFORM_ID);
  private db = inject(AppDatabase);

  async exportDatabase() {
    // Sécurité : s'assure qu'on est bien dans le navigateur
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Chargement dynamique du module de Dexie
      await import('dexie-export-import');

      // Export de la base de données
      const blob = await this.db.export();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export de la base :', error);
    }
  }
}