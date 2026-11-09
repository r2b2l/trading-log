import { Component, inject, signal, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppDatabase } from '../../services/app-database.service';
import { LexiconItem, LexiconCategory } from '../../models/lexicon.model';

interface ImagePreview {
  blob: Blob;
  url: string; // URL locale temporaire pour l'affichage <img [src]="url">
}

@Component({
  selector: 'app-lexicon-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lexicon-form.component.html'
})
export class LexiconFormComponent implements OnDestroy {
  private readonly db = inject(AppDatabase);
  private readonly cdr = inject(ChangeDetectorRef);

  public title = '';
  public category: LexiconCategory = 'setup';
  public description = '';
  
  // Stockage séparé pour l'affichage (url) et la base (blob)
  public imagesPreview = signal<ImagePreview[]>([]);

  public onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newPreviews: ImagePreview[] = [];

    for (let i = 0; i < input.files.length; i++) {
      const file: File = input.files[i];
      const url = URL.createObjectURL(file);
      newPreviews.push({ blob: file, url });
    }

    this.imagesPreview.update((current) => [...current, ...newPreviews]);
    input.value = ''; // Reset input
    this.cdr.markForCheck();
  }

  public removeImage(index: number): void {
    const current = this.imagesPreview();
    URL.revokeObjectURL(current[index].url);
    
    this.imagesPreview.set(current.filter((_, i) => i !== index));
    this.cdr.markForCheck();
  }

  public async saveLexiconItem(): Promise<void> {
    if (!this.title.trim()) {
      alert('Veuillez renseigner un titre.');
      return;
    }

    const newItem: LexiconItem = {
      id: crypto.randomUUID(),
      title: this.title,
      category: this.category,
      content: this.description,
      images: this.imagesPreview().map(item => item.blob),
      updatedAt: new Date().toISOString()
    };

    try {
      await this.db.table('lexicon').add(newItem);
      alert('Élément du lexique enregistré avec succès !');
      this.resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement dans Dexie :', error);
      alert('Erreur lors de l\'enregistrement.');
    }
  }

  private resetForm(): void {
    this.imagesPreview().forEach(item => URL.revokeObjectURL(item.url));
    this.title = '';
    this.category = this.category;
    this.description = '';
    this.imagesPreview.set([]);
    this.cdr.markForCheck();
  }

  public ngOnDestroy(): void {
    this.imagesPreview().forEach(item => URL.revokeObjectURL(item.url));
  }
}