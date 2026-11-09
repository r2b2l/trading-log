export interface Setup {
  id?: string;                // Unique identifier for the setup
  name: string;               // e.g., "Breakout Daily", "Liquidity Sweep"
  description?: string;
  winRateTarget?: number;
}