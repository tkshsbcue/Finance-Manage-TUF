import * as SQLite from 'expo-sqlite';
import { Transaction } from '@/types';

const DB_NAME = 'expense-tracker.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      categoryId TEXT NOT NULL,
      note TEXT DEFAULT '',
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(categoryId);
  `);
}

export async function insertTransaction(tx: Transaction): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO transactions (id, amount, type, categoryId, note, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [tx.id, tx.amount, tx.type, tx.categoryId, tx.note, tx.date, tx.createdAt]
  );
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE transactions SET amount = ?, type = ?, categoryId = ?, note = ?, date = ? WHERE id = ?',
    [tx.amount, tx.type, tx.categoryId, tx.note, tx.date, tx.id]
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getTransactions(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC, createdAt DESC',
    [startDate, endDate]
  );
  return results;
}

export async function getTransactionsByCategory(
  startDate: string,
  endDate: string,
  type: 'expense' | 'income'
): Promise<{ categoryId: string; total: number }[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT categoryId, SUM(amount) as total FROM transactions WHERE date >= ? AND date <= ? AND type = ? GROUP BY categoryId ORDER BY total DESC',
    [startDate, endDate, type]
  );
}

export async function getTotalByType(
  startDate: string,
  endDate: string,
  type: 'expense' | 'income'
): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE date >= ? AND date <= ? AND type = ?',
    [startDate, endDate, type]
  );
  return result?.total ?? 0;
}
