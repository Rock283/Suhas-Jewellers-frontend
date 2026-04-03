import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Phone, ChevronRight, MessageSquare, Filter, ArrowLeft, Calendar } from 'lucide-react';
import { calculateInterest, formatCurrency } from '@/lib/interest';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import BottomNav from '@/components/BottomNav';

type FilterTab = 'all' | 'active' | 'overdue' | 'due_today';
type SortOption = 'name' | 'newest' | 'amount' | 'oldest' | 'overdue' | 'interest';

const Customers = () => {
  const customers = useAppStore((s) => s.customers);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  const allLoans = customers.flatMap((c) => c.loans || []);
  const activeLoanCount = allLoans.filter((l) => l && l.status === 'active').length;
  const overdueLoanCount = allLoans.filter((l) => l && l.status === 'overdue').length;
  const totalLoanAmount = allLoans.filter((l) => l && l.status !== 'closed').reduce((s, l) => s + (l.loanAmount || 0), 0);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: customers.length },
    { key: 'active', label: 'Active', count: activeLoanCount },
    { key: 'overdue', label: 'Overdue', count: overdueLoanCount },
    { key: 'due_today', label: 'Due Today', count: 0 },
  ];

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && (c.loans || []).some((l) => l.status === 'active');
    if (activeTab === 'overdue') return matchesSearch && (c.loans || []).some((l) => l.status === 'overdue');
    return matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aLoans = a.loans || [];
    const bLoans = b.loans || [];
    
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'amount') {
      const aAmt = aLoans.filter(l => l.status !== 'closed').reduce((s, l) => s + l.loanAmount, 0);
      const bAmt = bLoans.filter(l => l.status !== 'closed').reduce((s, l) => s + l.loanAmount, 0);
      return bAmt - aAmt;
    }
    if (sortBy === 'oldest') {
      const aDate = aLoans.filter(l => l.status !== 'closed').map(l => new Date(l.startDate).getTime()).sort()[0] || Infinity;
      const bDate = bLoans.filter(l => l.status !== 'closed').map(l => new Date(l.startDate).getTime()).sort()[0] || Infinity;
      return aDate - bDate;
    }
    if (sortBy === 'overdue') {
      return (aLoans.some(l => l.status === 'overdue') ? 0 : 1) - (bLoans.some(l => l.status === 'overdue') ? 0 : 1);
    }
    if (sortBy === 'interest') {
      return bLoans.reduce((s, l) => s + calculateInterest(l).totalInterestDue, 0) - aLoans.reduce((s, l) => s + calculateInterest(l).totalInterestDue, 0);
    }
    return 0;
  });

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'newest', label: 'Newest First' },
    { key: 'name', label: 'Name (A–Z)' },
    { key: 'amount', label: 'Loan Amount' },
    { key: 'oldest', label: 'Oldest First' },
    { key: 'overdue', label: 'Overdue First' },
    { key: 'interest', label: 'Interest (High)' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-10 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Customers</h1>
          </div>
          <Sheet open={sortOpen} onOpenChange={setSortOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Filter className="w-5 h-5" /></Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="font-display">Sort By</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                      sortBy === opt.key ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-card" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-background/20 text-background' : 'bg-background text-muted-foreground'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <p className="text-lg font-display font-bold text-primary">{customers.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold text-success">{activeLoanCount}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold text-destructive">{overdueLoanCount}</p>
            <p className="text-[10px] text-muted-foreground">Overdue</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold text-foreground">{formatCurrency(totalLoanAmount)}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {sorted.length === 0 && <p className="text-center text-muted-foreground py-12">No customers found</p>}
        {sorted.map((c) => {
          const activeLoans = c.loans.filter((l) => l.status !== 'closed');
          const mainLoan = activeLoans[0];
          const hasOverdue = c.loans.some((l) => l.status === 'overdue');
          const status = hasOverdue ? 'Overdue' : activeLoans.length > 0 ? 'Active' : 'Closed';
          const totalPrincipal = activeLoans.reduce((s, l) => s + l.loanAmount, 0);
          const totalInterest = activeLoans.reduce((s, l) => s + calculateInterest(l).totalInterestDue, 0);
          const totalDue = activeLoans.reduce((s, l) => s + calculateInterest(l).pendingAmount, 0);
          const daysAgo = mainLoan ? Math.floor((Date.now() - new Date(mainLoan.startDate).getTime()) / 86400000) : 0;

          return (
            <div key={c.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 relative">
                  {hasOverdue && <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-[8px] font-bold z-10">!</span>}
                  {c.photo ? <img src={c.photo} alt={c.name} className="w-full h-full object-cover" /> : <span className="font-bold text-sm text-primary font-display">{c.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      status === 'Overdue' ? 'bg-destructive/10 text-destructive' : status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>{status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {c.phone}
                    {mainLoan && <> · <span className="text-foreground">{mainLoan.itemName}</span> · {mainLoan.purity}</>}
                  </p>
                </div>
              </div>

              {activeLoans.length > 0 && (
                <div className="flex gap-2 mb-3">
                  <div className="bg-primary/5 rounded-lg px-2.5 py-1.5">
                    <p className="text-[9px] text-muted-foreground">Principal</p>
                    <p className="text-xs font-bold text-primary">{formatCurrency(totalPrincipal)}</p>
                  </div>
                  <div className="bg-accent/5 rounded-lg px-2.5 py-1.5">
                    <p className="text-[9px] text-muted-foreground">Interest</p>
                    <p className="text-xs font-bold text-accent">{formatCurrency(totalInterest)}</p>
                  </div>
                  <div className={`rounded-lg px-2.5 py-1.5 ${hasOverdue ? 'bg-destructive/5' : 'bg-muted/50'}`}>
                    <p className="text-[9px] text-muted-foreground">Due</p>
                    <p className={`text-xs font-bold ${hasOverdue ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(totalDue)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {mainLoan && <>{daysAgo}d ago</>}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); window.open(`tel:${c.phone}`); }}>
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${c.phone.replace(/\D/g, '')}`); }}>
                    <MessageSquare className="w-3.5 h-3.5 text-success" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate(`/customer/${c.id}`)}>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <BottomNav />
    </div>
  );
};

export default Customers;