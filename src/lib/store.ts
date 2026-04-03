import { create } from 'zustand';
import { Customer, Loan, Payment } from './types';
import { mockCustomers } from './mock-data';

interface AuthState {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

interface AppState {
  customers: Customer[];
  deletedCustomer: { customer: Customer; index: number } | null;
  addCustomer: (customer: Omit<Customer, 'id' | 'loans' | 'createdAt'>) => void;
  updateCustomer: (id: string, data: Partial<Pick<Customer, 'name' | 'phone' | 'address' | 'photo'>>) => void;
  deleteCustomer: (id: string) => void;
  undoDeleteCustomer: () => void;
  addLoan: (customerId: string, loan: Omit<Loan, 'id' | 'customerId' | 'payments' | 'status'>) => void;
  updateLoan: (loanId: string, data: Partial<Omit<Loan, 'id' | 'customerId' | 'payments'>>) => void;
  addPayment: (loanId: string, payment: Omit<Payment, 'id' | 'loanId'>) => void;
  closeLoan: (loanId: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  setCustomers: (customers: Partial<Customer>[]) => void;
  clearCustomers: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: (pin: string) => {
    if (pin === '1234') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),
}));

const normalizeCustomer = (customer: any): Customer => ({
  id: customer.id || customer._id || Date.now().toString(),
  name: customer.name || '',
  phone: customer.phone || '',
  address: customer.address,
  photo: customer.photo,
  createdAt: customer.createdAt || new Date().toISOString().split('T')[0],
  loans: (customer.loans || []).map((loan: any) => ({
    id: loan.id || loan._id || Date.now().toString(),
    customerId: loan.customerId || customer.id || customer._id || '',
    itemName: loan.itemName || '',
    category: loan.category || 'gold',
    purity: loan.purity || '',
    weightGrams: loan.weightGrams || 0,
    marketRate: loan.marketRate || 0,
    loanAmount: loan.loanAmount || 0,
    interestRate: loan.interestRate || 0,
    startDate: loan.startDate || new Date().toISOString().split('T')[0],
    status: loan.status || 'active',
    itemPhoto: loan.itemPhoto,
    overdueMonths: loan.overdueMonths,
    payments: (loan.payments || []).map((payment: any) => ({
      id: payment.id || payment._id || Date.now().toString(),
      loanId: payment.loanId || loan.id || loan._id || '',
      amount: payment.amount || 0,
      date: payment.date || new Date().toISOString().split('T')[0],
      type: payment.type || 'principal',
    })),
  })),
});

export const useAppStore = create<AppState>((set, get) => ({
  customers: [],
  deletedCustomer: null,
  addCustomer: (data) => {
    const customer: Customer = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      loans: [],
    };
    // Add new customer at the beginning
    set((s) => ({ customers: [customer, ...s.customers] }));
  },
  updateCustomer: (id, data) => {
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },
  deleteCustomer: (id) => {
    const state = get();
    const index = state.customers.findIndex((c) => c.id === id);
    const customer = state.customers[index];
    if (customer) {
      set({
        customers: state.customers.filter((c) => c.id !== id),
        deletedCustomer: { customer, index },
      });
    }
  },
  undoDeleteCustomer: () => {
    const state = get();
    if (state.deletedCustomer) {
      const { customer, index } = state.deletedCustomer;
      const newCustomers = [...state.customers];
      newCustomers.splice(index, 0, customer);
      set({ customers: newCustomers, deletedCustomer: null });
    }
  },
  addLoan: (customerId, loanData) => {
    const loan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      customerId,
      status: 'active',
      payments: [],
    };
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId ? { ...c, loans: [...c.loans, loan] } : c
      ),
    }));
  },
  updateLoan: (loanId, data) => {
    set((s) => ({
      customers: s.customers.map((c) => ({
        ...c,
        loans: c.loans.map((l) => (l.id === loanId ? { ...l, ...data } : l)),
      })),
    }));
  },
  addPayment: (loanId, paymentData) => {
    const payment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      loanId,
    };
    set((s) => ({
      customers: s.customers.map((c) => ({
        ...c,
        loans: c.loans.map((l) =>
          l.id === loanId ? { ...l, payments: [...l.payments, payment] } : l
        ),
      })),
    }));
  },
  closeLoan: (loanId) => {
    set((s) => ({
      customers: s.customers.map((c) => ({
        ...c,
        loans: c.loans.map((l) =>
          l.id === loanId ? { ...l, status: 'closed' as const } : l
        ),
      })),
    }));
  },
  getCustomer: (id) => get().customers.find((c) => c.id === id),
  setCustomers: (customers) => set({ customers: customers.map(normalizeCustomer) }),
  clearCustomers: () => set({ customers: [] }),
}));
