export type LexiconCategory = 'vocabulary' | 'pattern' | 'setup' | 'mindset';

export interface LexiconItem {
  id?: string;                // Unique identifier for the lexicon item
  title: string;
  category: LexiconCategory;
  content: string;            // Text explanation
  images?: Blob[];        // Schema / image reference
  updatedAt: string;
}