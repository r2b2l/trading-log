import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDatabase } from '../../services/app-database.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lexicon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lexicon.component.html'
})
export class LexiconComponent {
  private db = inject(AppDatabase);

  // Tu pourras lier ici les données de la table lexicon de Dexie
}