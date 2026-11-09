export interface TradeGroup {
  id?: string;                // Unique identifier for the trade group
  name: string;               // e.g., "Week 42", "Challenge 10k"
  description?: string;
  color?: string;             // Tailwind color tag
}