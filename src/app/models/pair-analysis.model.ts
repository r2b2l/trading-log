export interface PairNote {
  id?: string;                // Unique identifier for the note
  pair: string;               // e.g., "BTC/USDT"
  date: string;               // Day or timestamp of the note
  note: string;
  tags?: string[];
}