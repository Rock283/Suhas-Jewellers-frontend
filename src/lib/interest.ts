import { Loan } from './types';

export function calculateInterest(loan: Loan): {
  monthlyInterest: number;
  totalInterestDue: number;
  totalPaid: number;
  pendingAmount: number;
  monthsElapsed: number;
  remainingPrincipal: number;
  remainingTotalInterest: number;
} {
  const start = new Date(loan.startDate);
  const now = new Date();

  // Mid-month logic: loan date determines the "month boundary"
  // If loan starts on 15th, next month's 15th = 1 full month
  // For current partial month: if past the 15th of current period = full month, else half month
  const startDay = start.getDate();
  
  let monthsElapsed = 0;
  
  if (now.getTime() > start.getTime()) {
    // Calculate full months between start and now
    const totalMonthsDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    // Check if we've passed the anniversary day in the current month
    const currentDay = now.getDate();
    
    if (totalMonthsDiff <= 0) {
      // Same month as start — no full month completed yet
      monthsElapsed = 0;
    } else {
      // Full completed months (not counting current partial month)
      if (currentDay >= startDay) {
        // We've passed the anniversary day — this counts as a full month
        monthsElapsed = totalMonthsDiff;
      } else {
        // Haven't reached anniversary day yet
        monthsElapsed = totalMonthsDiff - 1;
      }
    }
    
    // Now handle the current partial month
    // If we haven't completed a full cycle to the next anniversary day
    if (currentDay < startDay) {
      // We're in a partial month — check if past 15th of this period
      if (currentDay >= 15) {
        // Past 15th day into the period — count as full month
        monthsElapsed += 1;
      } else {
        // Before 15th — count as half month (0.5)
        monthsElapsed += 0.5;
      }
    }
    
    // Ensure at least some interest if loan has started
    if (monthsElapsed <= 0) {
      // Even a few days into a new loan = half month minimum
      monthsElapsed = 0.5;
    }
  }

  // Calculate remaining principal after principal payments
  const principalPaid = loan.payments
    .filter(p => p.type === 'principal' || p.type === 'full')
    .reduce((sum, p) => sum + p.amount, 0);
  const interestPaid = loan.payments
    .filter(p => p.type === 'interest')
    .reduce((sum, p) => sum + p.amount, 0);
  const partialPaid = loan.payments
    .filter(p => p.type === 'partial')
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingPrincipal = Math.max(0, loan.loanAmount - principalPaid - partialPaid);
  const monthlyInterest = (remainingPrincipal * loan.interestRate) / 100;

  let totalInterestDue: number;
  if (monthsElapsed <= 12) {
    totalInterestDue = monthlyInterest * monthsElapsed;
  } else {
    const simpleInterest = monthlyInterest * 12;
    const remainingMonths = monthsElapsed - 12;
    const compoundBase = remainingPrincipal + simpleInterest;
    const compoundInterest = compoundBase * Math.pow(1 + loan.interestRate / 100, remainingMonths) - compoundBase;
    totalInterestDue = simpleInterest + compoundInterest;
  }

  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingTotalInterest = Math.max(0, totalInterestDue - interestPaid);
  const pendingAmount = remainingPrincipal + totalInterestDue - interestPaid;

  return {
    monthlyInterest: Math.round(monthlyInterest),
    totalInterestDue: Math.round(totalInterestDue),
    totalPaid,
    pendingAmount: Math.round(Math.max(0, pendingAmount)),
    monthsElapsed: Math.round(monthsElapsed * 10) / 10,
    remainingPrincipal: Math.round(remainingPrincipal),
    remainingTotalInterest: Math.round(remainingTotalInterest),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
