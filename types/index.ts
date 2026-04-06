export type TransactionType = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string;
  date: string; // ISO string
  createdAt: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
};

export type DateFilter = 'day' | 'week' | 'month' | 'year';
