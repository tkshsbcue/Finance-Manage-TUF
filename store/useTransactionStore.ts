import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';
import { Transaction, TransactionType, DateFilter } from '@/types';
import * as db from '@/lib/database';

type TransactionStore = {
  transactions: Transaction[];
  totalExpense: number;
  totalIncome: number;
  dateFilter: DateFilter;
  selectedDate: Date;
  isLoading: boolean;

  setDateFilter: (filter: DateFilter) => void;
  setSelectedDate: (date: Date) => void;
  loadTransactions: () => Promise<void>;
  addTransaction: (
    amount: number,
    type: TransactionType,
    categoryId: string,
    note: string,
    date: Date
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getDateRange: () => { start: string; end: string };
};

function getDateRange(date: Date, filter: DateFilter) {
  let start: Date;
  let end: Date;

  switch (filter) {
    case 'day':
      start = startOfDay(date);
      end = endOfDay(date);
      break;
    case 'week':
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case 'year':
      start = startOfYear(date);
      end = endOfYear(date);
      break;
  }

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  totalExpense: 0,
  totalIncome: 0,
  dateFilter: 'month',
  selectedDate: new Date(),
  isLoading: false,

  getDateRange: () => {
    const { selectedDate, dateFilter } = get();
    return getDateRange(selectedDate, dateFilter);
  },

  setDateFilter: (filter) => {
    set({ dateFilter: filter });
    get().loadTransactions();
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadTransactions();
  },

  loadTransactions: async () => {
    set({ isLoading: true });
    try {
      const { selectedDate, dateFilter } = get();
      const { start, end } = getDateRange(selectedDate, dateFilter);

      const [transactions, totalExpense, totalIncome] = await Promise.all([
        db.getTransactions(start, end),
        db.getTotalByType(start, end, 'expense'),
        db.getTotalByType(start, end, 'income'),
      ]);

      set({ transactions, totalExpense, totalIncome });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (amount, type, categoryId, note, date) => {
    const transaction: Transaction = {
      id: uuidv4(),
      amount,
      type,
      categoryId,
      note,
      date: format(date, 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    };

    await db.insertTransaction(transaction);
    await get().loadTransactions();
  },

  deleteTransaction: async (id) => {
    await db.deleteTransaction(id);
    await get().loadTransactions();
  },
}));
