import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppDatabase } from '../../services/app-database.service';
import { LexiconItem } from '../../models/lexicon.model';

interface LexiconDisplayItem extends LexiconItem {
  parsedContent: { type: 'text' | 'image'; value: string }[];
  objectUrls: string[];
}

@Component({
  selector: 'app-lexicon',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lexicon.component.html'
})
export class LexiconComponent implements OnInit, OnDestroy {
  private readonly db = inject(AppDatabase);
  private readonly cdr = inject(ChangeDetectorRef);

  public items = signal<LexiconDisplayItem[]>([]);
  public isLoading = signal<boolean>(true);
  public activeModalItem = signal<LexiconDisplayItem | null>(null);

  // État du filtre actif ('all' ou une catégorie spécifique)
  public selectedCategory = signal<string>('all');

  // Liste filtrée automatiquement selon le signal selectedCategory
  public filteredItems = computed(() => {
    console.log('Calcul de filteredItems déclenché');
    const category = this.selectedCategory();
    const allItems = this.items();
    
    if (category === 'all') {
      return allItems;
    }
    
    return allItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
  });

  public async ngOnInit(): Promise<void> {
    await this.loadLexiconItems();
  }

  public async loadLexiconItems(): Promise<void> {
    this.isLoading.set(true);
    try {
      const rawItems: LexiconItem[] = await this.db.table('lexicon').toArray();

      const displayItems: LexiconDisplayItem[] = rawItems.map(item => {
        const objectUrls = item.images ? item.images.map(blob => URL.createObjectURL(blob)) : [];
        const parsedContent = this.parseDescriptionWithImages(item.content, objectUrls);

        return {
          ...item,
          parsedContent,
          objectUrls
        };
      });

      this.items.set(displayItems);
    } catch (error) {
      console.error('Erreur lors du chargement du lexique :', error);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  public setCategory(category: string): void {
    this.selectedCategory.set(category);
    this.cdr.markForCheck();
  }

  private parseDescriptionWithImages(description: string, urls: string[]): { type: 'text' | 'image'; value: string }[] {
    if (!description) return [];
    const regex = /\[\[image_(\d+)\]\]/g;
    const parts: { type: 'text' | 'image'; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(description)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: description.substring(lastIndex, match.index) });
      }
      const imageIndex = parseInt(match[1], 10) - 1;
      if (imageIndex >= 0 && imageIndex < urls.length) {
        parts.push({ type: 'image', value: urls[imageIndex] });
      } else {
        parts.push({ type: 'text', value: match[0] });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < description.length) {
      parts.push({ type: 'text', value: description.substring(lastIndex) });
    }

    return parts;
  }

  public openModal(item: LexiconDisplayItem): void {
    this.activeModalItem.set(item);
    this.cdr.markForCheck();
  }

  public closeModal(): void {
    this.activeModalItem.set(null);
    this.cdr.markForCheck();
  }

  public async deleteItem(id?: string, event?: Event): Promise<void> {
    if (event) event.stopPropagation(); // Empêche l'ouverture de la modale au clic sur supprimer
    if (!id || !confirm('Es-tu sûr de vouloir supprimer cet élément du lexique ?')) return;

    try {
      await this.db.table('lexicon').delete(id);
      await this.loadLexiconItems();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  }

  public ngOnDestroy(): void {
    this.items().forEach(item => {
      item.objectUrls.forEach(url => URL.revokeObjectURL(url));
    });
  }
}