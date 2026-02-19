
export type TransactionType = 'INCOME' | 'EXPENSE';
export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  items: string[];
}

export interface Transaction {
  id: string;
  date: string;
  code: string;
  description: string;
  type: TransactionType;
  mainCategory: string;
  subCategory: string;
  amount: number;
  remarks: string;
  comments: Comment[];
  createdBy: string; // User ID
  isRecurring?: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  lastGeneratedDate?: string;
}

export interface PayrollEntry {
  id: string;
  period: string;
  employee: {
    name: string;
    nik: string;
    position: string;
    unit: string;
    status: 'Tetap' | 'Kontrak' | 'Honorer';
  };
  income: {
    basic: number;
    position: number;
    transport: number;
    meal: number;
    family: number;
    performance: number;
    specialTask: number;
    overtime: number;
    bonus: number;
  };
  deduction: {
    bpjsHealth: number;
    bpjsEmployment: number;
    taxPph21: number;
    absence: number;
    loan: number;
    infaq: number;
    others: number;
  };
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
