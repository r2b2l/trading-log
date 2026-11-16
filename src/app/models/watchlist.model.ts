export type WatchlistStatus = 'active' | 'pending' | 'watching' | 'archived';

export interface WatchlistItem {
  id?: string;                // Unique identifier for the watchlist item
  pair: string;
  reason: string;             // e.g., "Waiting for zone retest at 62k"
  targetPrice?: number;
  status: WatchlistStatus;
  createdAt: string;
}