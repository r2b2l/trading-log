export interface Dividend {
  id?: string;                // Unique identifier for the dividend
  asset: string;              // e.g., "AAPL", "MSFT"
  amount: number;
  exDate: string;
  paymentDate: string;
  notes?: string;
}