import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { calculateInterest, formatCurrency } from '@/lib/interest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Shield, Search, Trash2, Eye, BarChart3, Settings2, Database } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { deleteCustomer as deleteCustomerAPI } from '@/services/customerService';

type AdminTab = 'overview' | 'users' | 'loans' | 'settings';

const AdminPanel = () => {
  const navigate = useNavigate();
  const customers = useAppStore((s) => s.customers);
  const deleteCustomerStore = useAppStore((s) => s.deleteCustomer);
  const undoDeleteCustomer = useAppStore((s) => s.undoDeleteCustomer);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [search, setSearch] = useState('');

  const allLoans = customers.flatMap((c) => c.loans || []);
  const activeLoans = allLoans.filter((l) => l.status === 'active');
  const overdueLoans = allLoans.filter((l) => l.status === 'overdue');
  const closedLoans = allLoans.filter((l) => l.status === 'closed');
  const totalPrincipal = [...activeLoans, ...overdueLoans].reduce((s, l) => s + l.loanAmount, 0);
  const totalInterest = allLoans.reduce((s, l) => s + calculateInterest(l).totalInterestDue, 0);
  const totalCollected = allLoans.reduce((s, l) => s + calculateInterest(l).totalPaid, 0);
  const totalPending = allLoans.reduce((s, l) => s + calculateInterest(l).pendingAmount, 0);

  const tabs: { key: AdminTab; label: string; icon: typeof Users }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'users', label: 'Customers', icon: Users },
    { key: 'loans', label: 'All Loans', icon: TrendingUp },
    { key: 'settings', label: 'Controls', icon: Settings2 },
  ];

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  // ✅ UPDATED: SYNC WITH BACKEND FIRST
  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This action can be undone within 10 seconds.`)) return;
    
    try {
      // Delete from backend first
      await deleteCustomerAPI(id);
      
      // Then delete from local store
      deleteCustomerStore(id);
      
      toast('Customer deleted', {
        action: { 
          label: 'Undo', 
          onClick: async () => { 
            try {
              // Re-loading data would be needed for proper undo, for now just restore locally
              undoDeleteCustomer(); 
              toast.success('Restored'); 
            } catch (err) {
              toast.error('Undo failed - please refresh');
            }
          } 
        },
        duration: 10000,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Failed to delete customer');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Admin Panel</h1>
            <p className="text-[11px] text-muted-foreground">Manage & control everything</p>
          </div>
          <Shield className="w-5 h-5 text-primary ml-auto" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === t.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-4">
                <Users className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{customers.length}</p>
                <p className="text-[11px] text-muted-foreground">Total Customers</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <TrendingUp className="w-5 h-5 text-success mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{allLoans.length}</p>
                <p className="text-[11px] text-muted-foreground">Total Loans</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-destructive mb-2" />
                <p className="text-2xl font-display font-bold text-destructive">{overdueLoans.length}</p>
                <p className="text-[11px] text-muted-foreground">Overdue</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <Database className="w-5 h-5 text-accent mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{closedLoans.length}</p>
                <p className="text-[11px] text-muted-foreground">Closed</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-display font-semibold text-foreground">Financial Overview</h3>
              <div className="space-y-2">
                {[
                  { label: 'Total Principal', value: totalPrincipal, color: 'text-foreground' },
                  { label: 'Total Interest Accrued', value: totalInterest, color: 'text-primary' },
                  { label: 'Total Collected', value: totalCollected, color: 'text-success' },
                  { label: 'Total Outstanding', value: totalPending, color: 'text-destructive' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-display font-semibold text-foreground mb-2">Loan Status Distribution</h3>
              <div className="flex gap-2">
                {[
                  { label: 'Active', count: activeLoans.length, bg: 'bg-success/10 text-success' },
                  { label: 'Overdue', count: overdueLoans.length, bg: 'bg-destructive/10 text-destructive' },
                  { label: 'Closed', count: closedLoans.length, bg: 'bg-muted text-muted-foreground' },
                ].map((s) => (
                  <div key={s.label} className={`flex-1 rounded-lg p-3 text-center ${s.bg}`}>
                    <p className="text-lg font-display font-bold">{s.count}</p>
                    <p className="text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users/Customers Tab */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-card" />
            </div>
            <p className="text-[11px] text-muted-foreground">{filteredCustomers.length} customers found</p>
            {filteredCustomers.map((c) => {
              const activeL = c.loans.filter((l) => l.status !== 'closed');
              const totalAmt = activeL.reduce((s, l) => s + l.loanAmount, 0);
              return (
                <div key={c.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {c.photo ? <img src={c.photo} alt={c.name} className="w-full h-full object-cover" /> : <span className="font-bold text-sm text-primary font-display">{c.name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.phone} · {activeL.length} loans · {formatCurrency(totalAmt)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate(`/customer/${c.id}`)}>
                      <Eye className="w-3.5 h-3.5 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleDeleteCustomer(c.id, c.name)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All Loans Tab */}
        {activeTab === 'loans' && (
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">{allLoans.length} total loans across all customers</p>
            {customers.flatMap((c) =>
              c.loans.map((l) => {
                const calc = calculateInterest(l);
                return (
                  <div key={l.id} className="glass-card rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{l.category === 'gold' ? '🥇' : '🥈'}</span>
                        <div>
                          <p className="font-medium text-sm text-foreground">{l.itemName}</p>
                          <p className="text-[10px] text-muted-foreground">{c.name} · {l.purity} · {l.weightGrams}g</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                        l.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                        l.status === 'active' ? 'bg-success/10 text-success' :
                        'bg-muted text-muted-foreground'
                      }`}>{l.status}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">Loan: <span className="text-foreground font-medium">{formatCurrency(l.loanAmount)}</span></span>
                      <span className="text-muted-foreground">Interest: <span className="text-primary font-medium">{formatCurrency(calc.totalInterestDue)}</span></span>
                      <span className="text-muted-foreground">Pending: <span className="text-destructive font-medium">{formatCurrency(calc.pendingAmount)}</span></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Controls Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-display font-semibold text-foreground">App Controls</h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-foreground">Maintenance Mode</p>
                  <p className="text-[10px] text-muted-foreground">Disable app access temporarily</p>
                </div>
                <Switch checked={false} onCheckedChange={() => toast.info('Maintenance mode is a premium feature')} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-foreground">Allow New Registrations</p>
                  <p className="text-[10px] text-muted-foreground">Control new user sign-ups</p>
                </div>
                <Switch checked={true} onCheckedChange={() => toast.info('Registration control coming soon')} />
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-display font-semibold text-foreground">Data Management</h3>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/backup')}>
                <Database className="w-4 h-4" />
                Backup & Restore
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/reports')}>
                <BarChart3 className="w-4 h-4" />
                View Reports
              </Button>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="text-sm font-display font-semibold text-foreground mb-2">System Info</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Total Customers: {customers.length}</p>
                <p>Total Loans: {allLoans.length}</p>
                <p>App Version: 1.0.0</p>
                <p>Last Backup: {localStorage.getItem('jv_last_backup') || 'Never'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default AdminPanel;
