import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Gem } from 'lucide-react';
import { toast } from 'sonner';
import PhotoUpload from '@/components/PhotoUpload';
import { Loan } from '@/lib/types';
import { createLoan, updateLoan as updateLoanAPI } from '@/services/loanService';
import { getCustomers } from '@/services/customerService';

const goldPurities = ['24K', '22K', '20K', '18K', '14K'];
const silverPurities = ['99.9%', '92.5%', '90%', '80%'];

interface LoanFormData {
  itemName: string;
  category: 'gold' | 'silver';
  purity: string;
  weightGrams: string;
  marketRate: string;
  loanAmount: string;
  interestRate: string;
  startDate: string;
  itemPhoto?: string;
  overdueMonths: string;
}

const AddLoan = () => {
  const { customerId, loanId } = useParams();
  const navigate = useNavigate();
  const customer = useAppStore((s) => s.getCustomer(customerId || ''));

  const existingLoan = loanId ? customer?.loans.find((l) => l.id === loanId || l.id === loanId) : undefined;
  const isEdit = !!existingLoan;

  const emptyForm: LoanFormData = {
    itemName: '',
    category: 'gold',
    purity: '22K',
    weightGrams: '',
    marketRate: '',
    loanAmount: '',
    interestRate: '1.5',
    startDate: new Date().toISOString().split('T')[0],
    itemPhoto: undefined,
    overdueMonths: '12',
  };

  const [form, setForm] = useState<LoanFormData>(emptyForm);

  const getLoanForm = (loan: Loan | undefined): LoanFormData => {
    if (!loan) return emptyForm;
    return {
      itemName: loan.itemName || '',
      category: loan.category || 'gold',
      purity: loan.purity || (loan.category === 'silver' ? '92.5%' : '22K'),
      weightGrams: loan.weightGrams?.toString() || '',
      marketRate: loan.marketRate?.toString() || '',
      loanAmount: loan.loanAmount?.toString() || '',
      interestRate: loan.interestRate?.toString() || '1.5',
      startDate: loan.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      itemPhoto: loan.itemPhoto,
      overdueMonths: (loan.overdueMonths || 12).toString(),
    };
  };

  useEffect(() => {
    if (isEdit && existingLoan) {
      setForm(getLoanForm(existingLoan));
    } else {
      setForm(emptyForm);
    }
  }, [isEdit, existingLoan]);

  const setCustomers = useAppStore((s) => s.setCustomers);
  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const purities = form.category === 'gold' ? goldPurities : silverPurities;
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidObjectId = (id: string | undefined): boolean => /^[0-9a-fA-F]{24}$/.test(id || '');

  useEffect(() => {
    if (!customer && customerId) {
      // Customer not in store, fetch from backend
      setPageLoading(true);
      getCustomers()
        .then((res) => {
          setCustomers(res.data || []);
        })
        .catch((error) => {
          console.error('Failed to fetch customers:', error);
          toast.error('Failed to load customer data');
        })
        .finally(() => setPageLoading(false));
    }
  }, [customer, customerId, setCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName || !form.weightGrams || !form.loanAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    const loanData = {
      customer: customerId,
      itemName: form.itemName,
      category: form.category,
      purity: form.purity,
      weightGrams: parseFloat(form.weightGrams),
      marketRate: parseFloat(form.marketRate) || 0,
      loanAmount: parseFloat(form.loanAmount),
      interestRate: parseFloat(form.interestRate),
      startDate: form.startDate,
      itemPhoto: form.itemPhoto,
      overdueMonths: parseInt(form.overdueMonths) || 12,
      duration: parseInt(form.overdueMonths) || 12,
    };

    try {
      setSubmitting(true);

      if (isEdit && isValidObjectId(loanId)) {
        await updateLoanAPI(loanId!, loanData);
        toast.success('Loan updated successfully');
      } else {
        // If loanId isn't a valid DB ID, create as new loan and avoid invalid PUT
        await createLoan(loanData);
        toast.success('Loan saved successfully');
      }

      const customersRes = await getCustomers();
      setCustomers(customersRes.data || []);

      navigate(`/customer/${customerId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.msg || 'Failed to save loan');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground font-body">Loading customer details...</p></div>;
  }

  if (!customer) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground font-body">Customer not found</p></div>;
  }

  if (isEdit && !existingLoan) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground font-body">Loan not found</p></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/customer/${customerId}`)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">{isEdit ? 'Edit Loan' : 'New Loan'}</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body ml-12 mb-6">for {customer.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <PhotoUpload
              photo={form.itemPhoto}
              onPhotoChange={(p) => setForm((f) => ({ ...f, itemPhoto: p }))}
              size="sm"
              label="Item Photo"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Item Name *</Label>
            <Input value={form.itemName} onChange={(e) => update('itemName', e.target.value)} placeholder="e.g., Gold Necklace" className="h-11 font-body" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-body text-sm">Category *</Label>
              <Select value={form.category} onValueChange={(v) => { update('category', v); update('purity', v === 'gold' ? '22K' : '92.5%'); }}>
                <SelectTrigger className="h-11 font-body"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">🥇 Gold</SelectItem>
                  <SelectItem value="silver">🥈 Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Purity</Label>
              <Select value={form.purity} onValueChange={(v) => update('purity', v)}>
                <SelectTrigger className="h-11 font-body"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {purities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-body text-sm">Weight (grams) *</Label>
              <Input type="number" value={form.weightGrams} onChange={(e) => update('weightGrams', e.target.value)} placeholder="0" className="h-11 font-body" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Market Rate (₹/g)</Label>
              <Input type="number" value={form.marketRate} onChange={(e) => update('marketRate', e.target.value)} placeholder="0" className="h-11 font-body" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-body text-sm">Loan Amount (₹) *</Label>
              <Input type="number" value={form.loanAmount} onChange={(e) => update('loanAmount', e.target.value)} placeholder="0" className="h-11 font-body" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Interest (%/month)</Label>
              <Input type="number" value={form.interestRate} onChange={(e) => update('interestRate', e.target.value)} placeholder="1.5" className="h-11 font-body" step="0.1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-body text-sm">Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="h-11 font-body" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Overdue After (months)</Label>
              <Input type="number" value={form.overdueMonths} onChange={(e) => update('overdueMonths', e.target.value)} placeholder="12" className="h-11 font-body" min="1" />
            </div>
          </div>

          <Button
            type="submit"
            loading={submitting}
            loadingText={isEdit ? 'Updating Loan...' : 'Creating Loan...'}
            className="w-full h-12 gradient-gold text-primary-foreground font-semibold border-0 hover:opacity-90 transition-opacity gap-2 mt-2"
          >
            <Gem className="w-5 h-5" />
            {isEdit ? 'Update Loan' : 'Create Loan'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddLoan;
