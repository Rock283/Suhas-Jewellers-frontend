export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  photo?: string;
  createdAt: string;
  loans: Loan[];
}

export interface Loan {
  id: string;
  customerId: string;
  itemName: string;
  category: 'gold' | 'silver';
  purity: string;
  weightGrams: number;
  marketRate: number;
  loanAmount: number;
  interestRate: number;
  startDate: string;
  status: 'active' | 'closed' | 'overdue';
  itemPhoto?: string;
  overdueMonths?: number; // customizable overdue threshold in months
  payments: Payment[];
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  type: 'interest' | 'principal' | 'partial' | 'full';
}

export type LoanStatus = Loan['status'];
