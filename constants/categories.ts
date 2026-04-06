import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'food', name: 'Food & Dining', icon: 'cutlery', color: '#ef4444', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#f97316', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#a855f7', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'bolt', color: '#eab308', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#ec4899', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'heartbeat', color: '#14b8a6', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'book', color: '#6366f1', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#22c55e', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: 'home', color: '#64748b', type: 'expense' },
  { id: 'other-expense', name: 'Other', icon: 'ellipsis-h', color: '#94a3b8', type: 'expense' },

  // Income
  { id: 'salary', name: 'Salary', icon: 'money', color: '#10b981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#06b6d4', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'line-chart', color: '#8b5cf6', type: 'income' },
  { id: 'gift', name: 'Gift', icon: 'gift', color: '#f43f5e', type: 'income' },
  { id: 'other-income', name: 'Other', icon: 'ellipsis-h', color: '#6b7280', type: 'income' },
];

export const getCategoryById = (id: string): Category | undefined =>
  DEFAULT_CATEGORIES.find((c) => c.id === id);
