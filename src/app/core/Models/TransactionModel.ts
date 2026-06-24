export interface TransactionResponse {
  id: number;
  type: string;
  amount: number;
  category: string;
  title: string;
  description?: string;
  transactionDate: string;
  accountName?: string;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  // TypeScript dictionary representation matching C# Dictionary<string, List<TransactionResponseDto>>
  groupedTransactions: { [key: string]: TransactionResponse[] };
}

export interface CalendarDay {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  hasActivity: boolean;
}