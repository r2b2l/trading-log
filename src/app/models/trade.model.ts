export type TradeMode = 'paper' | 'real' | 'test' | 'incognito';

export interface Trade {
  id?: string;                // Unique identifier for the trade
  pair: string;               // e.g., "BTC/USDT", "EUR/USD"
  date: string;               // ISO format ("YYYY-MM-DDTHH:mm")
  entryPrice: number;
  exitPrice?: number;
  mode: TradeMode;
  setupId?: number;           // Reference to used setup
  groupId?: number;           // Reference to trade group
  notes?: string;
  pnl?: number;               // Calculated or entered
  isBacktest?: boolean;       // Flag for backtesting trades
  createdAt: string;
}