import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { Loan, Payment } from '@/lib/types';
import { calculateInterest, formatCurrency } from '@/lib/interest';
import { toast } from 'sonner';
import { IndianRupee } from 'lucide-react';
import { addLoanPayment } from '@/services/loanService';
import { getCustomers } from '@/services/customerService';

interface PaymentDialogProps {
  loan: Loan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentDialog = ({ loan, open, onOpenChange }: PaymentDialogProps) => {
  const addPayment = useAppStore((s) => s.addPayment);
  const closeLoan = useAppStore((s) => s.closeLoan);
  const setCustomers = useAppStore((s) => s.setCustomers);
  const calc = calculateInterest(loan);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Payment['type']>('interest');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      await addLoanPayment(loan.id, { amount: amt, date, type });
      const customersRes = await getCustomers();
      setCustomers(customersRes.data || []);

      if (type === 'full' || amt >= calc.pendingAmount) {
        closeLoan(loan.id);
        toast.success('Payment recorded & loan closed');
      } else {
        toast.success('Payment recorded');
      }
    } catch (err: any) {
      console.error('Payment API error', err);
      toast.error(err.response?.data?.msg || 'Failed to record payment');
      return;
    } finally {
      setSubmitting(false);
    }

    setAmount('');
    setType('interest');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground">Principal</p>
              <p className="font-bold text-foreground">{formatCurrency(calc.remainingPrincipal)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground">Interest/mo</p>
              <p className="font-bold text-primary">{formatCurrency(calc.monthlyInterest)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-muted-foreground">Pending</p>
              <p className="font-bold text-destructive">{formatCurrency(calc.pendingAmount)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Amount (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-11" autoFocus disabled={submitting} />
              <div className="flex gap-2 flex-wrap">
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setAmount(calc.monthlyInterest.toString())} disabled={submitting}>
                  Monthly Int.
                </Button>
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => {
                  const partial = Math.round(calc.pendingAmount / 2);
                  setAmount(partial.toString());
                  setType('partial');
                }} disabled={submitting}>
                  Partial (50%)
                </Button>
                <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => { setAmount(calc.pendingAmount.toString()); setType('full'); }} disabled={submitting}>
                  Full Amount
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Payment['type'])} disabled={submitting}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interest">Interest</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="full">Full Settlement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" disabled={submitting} />
              </div>
            </div>

            <Button
              type="submit"
              loading={submitting}
              loadingText="Recording Payment..."
              className="w-full h-11 gradient-gold text-primary-foreground font-semibold border-0 hover:opacity-90"
            >
              <IndianRupee className="w-4 h-4 mr-1" />
              Record Payment
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
