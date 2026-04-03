import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { calculateInterest, formatCurrency } from '@/lib/interest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, PlusCircle, Phone, MapPin, Calendar, DollarSign, Pencil, IndianRupee, MessageSquare, Bell, Clock, Trash2 } from 'lucide-react';
import { LoanStatus } from '@/lib/types';
import { toast } from 'sonner';
import PhotoUpload from '@/components/PhotoUpload';
import PaymentDialog from '@/components/PaymentDialog';
import ReminderDialog from '@/components/ReminderDialog';
import { updateCustomer as updateCustomerAPI, deleteCustomer as deleteCustomerAPI } from '@/services/customerService';

const statusStyles: Record<LoanStatus, string> = {
  active: 'bg-primary/10 text-primary',
  closed: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useAppStore((s) => s.getCustomer(id || ''));
  const updateCustomerStore = useAppStore((s) => s.updateCustomer);
  const deleteCustomerStore = useAppStore((s) => s.deleteCustomer);
  const undoDeleteCustomer = useAppStore((s) => s.undoDeleteCustomer);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhoto, setEditPhoto] = useState<string | undefined>();
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [reminderLoanId, setReminderLoanId] = useState<string | null>(null);
  const [historyLoanId, setHistoryLoanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    );
  }

  const openEdit = () => {
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditAddress(customer.address || '');
    setEditPhoto(customer.photo);
    setEditOpen(true);
  };

  // ✅ UPDATED: SYNC WITH BACKEND FIRST
  const saveEdit = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      setLoading(true);
      
      // Update backend first
      await updateCustomerAPI(customer.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim() || undefined,
        photo: editPhoto,
      });

      // Then update local store
      updateCustomerStore(customer.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim() || undefined,
        photo: editPhoto,
      });

      toast.success('Customer updated');
      setEditOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: SYNC WITH BACKEND FIRST
  const handleDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      toast.error('Type "delete" to confirm');
      return;
    }

    try {
      setLoading(true);
      
      // Delete from backend first
      await deleteCustomerAPI(customer.id);

      // Then delete from local store
      deleteCustomerStore(customer.id);

      setDeleteOpen(false);
      setDeleteConfirmText('');
      navigate('/customers');
      
      toast.success('Customer deleted');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const paymentLoan = customer.loans.find((l) => l.id === paymentLoanId);
  const reminderLoan = customer.loans.find((l) => l.id === reminderLoanId);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-gold px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-bold text-primary-foreground">Customer Details</h1>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={openEdit} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} className="text-primary-foreground/80 hover:text-destructive hover:bg-primary-foreground/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold text-2xl font-display shrink-0 ring-2 ring-primary-foreground/30">
            {customer.photo ? (
              <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover" />
            ) : (
              customer.name.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-display font-bold text-primary-foreground truncate">{customer.name}</h2>
            <div className="flex items-center gap-1.5 text-primary-foreground/70 text-sm mt-1">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </div>
            {customer.address && (
              <div className="flex items-center gap-1.5 text-primary-foreground/70 text-xs mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loans */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-display font-semibold text-foreground">Pledged Items</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/add-loan/${customer.id}`)} className="text-primary gap-1">
            <PlusCircle className="w-4 h-4" />
            Add Loan
          </Button>
        </div>

        {/* Loan Summary Box */}
        {customer.loans.length > 0 && (
          <div className="glass-card rounded-xl p-4 mb-4">
            <h4 className="text-sm font-display font-semibold text-foreground mb-3">Loan Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const totalLoans = customer.loans.length;
                const totalLoanAmount = customer.loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
                const totalRemaining = customer.loans.reduce((sum, loan) => {
                  const calc = calculateInterest(loan);
                  return sum + calc.pendingAmount;
                }, 0);
                const totalPaid = customer.loans.reduce((sum, loan) => {
                  const calc = calculateInterest(loan);
                  return sum + calc.totalPaid;
                }, 0);

                return (
                  <>
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Loans</p>
                      <p className="text-lg font-bold text-primary">{totalLoans}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Loan Amount</p>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(totalLoanAmount)}</p>
                    </div>
                    <div className="bg-destructive/5 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Pending</p>
                      <p className="text-sm font-semibold text-destructive">{formatCurrency(totalRemaining)}</p>
                    </div>
                    <div className="bg-success/5 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                      <p className="text-sm font-semibold text-success">{formatCurrency(totalPaid)}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {customer.loans.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No loans yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customer.loans.map((loan) => {
              const calc = calculateInterest(loan);
              return (
                <div key={loan.id} className="glass-card rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {loan.itemPhoto && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border">
                          <img src={loan.itemPhoto} alt={loan.itemName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{loan.itemName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {loan.category === 'gold' ? '🥇' : '🥈'} {loan.purity} · {loan.weightGrams}g
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary" onClick={() => navigate(`/edit-loan/${customer.id}/${loan.id}`)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusStyles[loan.status]}`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">Original Loan</p>
                      <p className="font-semibold text-foreground">{formatCurrency(loan.loanAmount)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">Remaining Principal</p>
                      <p className="font-semibold text-foreground">{formatCurrency(calc.remainingPrincipal)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">Interest ({loan.interestRate}%/mo)</p>
                      <p className="font-semibold text-primary">{formatCurrency(calc.monthlyInterest)}/mo</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">Total Paid</p>
                      <p className="font-semibold text-success">{formatCurrency(calc.totalPaid)}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">Remaining Interest</p>
                      <p className="font-bold text-primary text-sm">{formatCurrency(calc.remainingTotalInterest)}</p>
                    </div>
                    <div className="bg-destructive/5 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">Total Pending</p>
                      <p className="font-bold text-destructive text-sm">{formatCurrency(calc.pendingAmount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Started {new Date(loan.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    · {calc.monthsElapsed} months
                    <span className="ml-auto text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-muted whitespace-nowrap">
                      OD: {loan.overdueMonths || 12}mo
                    </span>
                  </div>

                  {loan.status !== 'closed' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => setPaymentLoanId(loan.id)}>
                        <IndianRupee className="w-3.5 h-3.5" />
                        Add Payment
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => setReminderLoanId(loan.id)}>
                        <Bell className="w-3.5 h-3.5" />
                        Reminder
                      </Button>
                    </div>
                  )}

                  {loan.payments.length > 0 && (
                    <div className="mt-3">
                      <button onClick={() => setHistoryLoanId(historyLoanId === loan.id ? null : loan.id)} className="text-xs text-primary font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {historyLoanId === loan.id ? 'Hide' : 'View'} Payment History ({loan.payments.length})
                      </button>
                      {historyLoanId === loan.id && (
                        <div className="mt-2 space-y-1">
                          {loan.payments.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs">
                              <div>
                                <span className="capitalize text-muted-foreground">{p.type}</span>
                                <span className="text-muted-foreground"> · </span>
                                <span className="text-muted-foreground">{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <span className="font-semibold text-success">{formatCurrency(p.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      {paymentLoan && (
        <PaymentDialog loan={paymentLoan} open={!!paymentLoanId} onOpenChange={(open) => !open && setPaymentLoanId(null)} />
      )}

      {/* Reminder Dialog */}
      {reminderLoan && (
        <ReminderDialog customer={customer} loan={reminderLoan} open={!!reminderLoanId} onOpenChange={(open) => !open && setReminderLoanId(null)} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              This will permanently delete <span className="font-semibold text-foreground">{customer.name}</span> and all their loan records. Type <span className="font-mono font-bold text-destructive">delete</span> to confirm.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="h-11 font-mono"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirmText(''); }} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteConfirmText.toLowerCase() !== 'delete'} className="flex-1">
                Delete Customer
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">You can undo within 10 seconds after deletion</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex justify-center">
              <PhotoUpload photo={editPhoto} onPhotoChange={setEditPhoto} label="Customer Photo" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Full Name *</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone *</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Address</Label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="h-11" />
            </div>
            <Button onClick={saveEdit} className="w-full h-11 gradient-gold text-primary-foreground font-semibold border-0 hover:opacity-90">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDetail;