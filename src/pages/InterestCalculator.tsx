import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calculator, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/interest';

const InterestCalculator = () => {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('1.5');
  const [months, setMonths] = useState('12');
  const [compoundAfter, setCompoundAfter] = useState('12');

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const m = parseInt(months) || 0;
  const ca = parseInt(compoundAfter) || 12;

  const monthlyInterest = (p * r) / 100;

  let totalInterest = 0;
  if (m <= ca) {
    totalInterest = monthlyInterest * m;
  } else {
    const simpleInterest = monthlyInterest * ca;
    const compoundBase = p + simpleInterest;
    const remainingMonths = m - ca;
    const compoundInterest = compoundBase * Math.pow(1 + r / 100, remainingMonths) - compoundBase;
    totalInterest = simpleInterest + compoundInterest;
  }

  const totalPayable = p + totalInterest;

  const breakdown = Array.from({ length: Math.min(m, 24) }, (_, i) => {
    const month = i + 1;
    let interest: number;
    if (month <= ca) {
      interest = monthlyInterest * month;
    } else {
      const simple = monthlyInterest * ca;
      const base = p + simple;
      interest = simple + (base * Math.pow(1 + r / 100, month - ca) - base);
    }
    return { month, interest: Math.round(interest), total: Math.round(p + interest) };
  });

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Interest Calculator</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm">Principal Amount (₹)</Label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 100000" className="h-11 font-body" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-body text-sm">Interest Rate (%/month)</Label>
              <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="1.5" className="h-11 font-body" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Duration (months)</Label>
              <Input type="number" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="12" className="h-11 font-body" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Compound After (months)</Label>
            <Input type="number" value={compoundAfter} onChange={(e) => setCompoundAfter(e.target.value)} placeholder="12" className="h-11 font-body" />
          </div>
        </div>

        {p > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground font-body">Monthly Interest</p>
                <p className="text-lg font-display font-bold text-primary">{formatCurrency(monthlyInterest)}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground font-body">Total Interest ({m} mo)</p>
                <p className="text-lg font-display font-bold text-accent">{formatCurrency(Math.round(totalInterest))}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground font-body">Principal</p>
                <p className="text-lg font-display font-bold text-foreground">{formatCurrency(p)}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground font-body">Total Payable</p>
                <p className="text-lg font-display font-bold text-destructive">{formatCurrency(Math.round(totalPayable))}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="glass-card rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-display font-semibold text-foreground">Monthly Breakdown</h3>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-3 text-[10px] text-muted-foreground font-body py-1 border-b border-border">
                  <span>Month</span>
                  <span className="text-right">Interest</span>
                  <span className="text-right">Total Payable</span>
                </div>
                {breakdown.map((row) => (
                  <div key={row.month} className={`grid grid-cols-3 text-xs font-body py-1.5 ${row.month > ca ? 'text-accent' : 'text-foreground'}`}>
                    <span>{row.month}{row.month > ca ? ' ⚡' : ''}</span>
                    <span className="text-right">{formatCurrency(row.interest)}</span>
                    <span className="text-right font-medium">{formatCurrency(row.total)}</span>
                  </div>
                ))}
              </div>
              {m > ca && (
                <p className="text-[10px] text-accent font-body mt-2">⚡ Compound interest applied after month {ca}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterestCalculator;
