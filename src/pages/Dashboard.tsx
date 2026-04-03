import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, calculateInterest } from '@/lib/interest';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertTriangle, Clock, Bell, Settings, UserPlus, Calculator, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import BottomNav from '@/components/BottomNav';

type ChartPeriod = '7days' | 'month' | 'year';

const Dashboard = () => {
  const customers = useAppStore((s) => s.customers);
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7days');
  const [fabVisible, setFabVisible] = useState(true);
  const lastScrollY = useRef(0);

  const allLoans = customers.flatMap((c) => c.loans || []);
  const activeLoans = allLoans.filter((l) => l.status === 'active');
  const overdueLoans = allLoans.filter((l) => l.status === 'overdue');
  const closedLoans = allLoans.filter((l) => l.status === 'closed');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.loanAmount, 0) + overdueLoans.reduce((sum, l) => sum + l.loanAmount, 0);
  const totalInterestEarned = allLoans.reduce((sum, l) => sum + calculateInterest(l).totalPaid, 0);
  const overdueAmount = overdueLoans.reduce((sum, l) => sum + l.loanAmount, 0);

  const appName = localStorage.getItem('jv_app_name') || 'JewelVault';
  const userName = localStorage.getItem('jv_user_name') || 'User';

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) {
        setFabVisible(false);
      } else {
        setFabVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const now = new Date();

  const generateChartData = (period: ChartPeriod) => {
    const data: { name: string; amount: number }[] = [];
    if (period === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayLoans = allLoans.filter(l => new Date(l.startDate).toDateString() === d.toDateString());
        data.push({ name: d.toLocaleDateString('en-IN', { weekday: 'short' }), amount: dayLoans.reduce((s, l) => s + l.loanAmount, 0) });
      }
    } else if (period === 'month') {
      for (let w = 0; w < 4; w++) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), w * 7 + 1);
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), (w + 1) * 7 + 1);
        const weekLoans = allLoans.filter(l => { const start = new Date(l.startDate); return start >= weekStart && start < weekEnd; });
        data.push({ name: `W${w + 1}`, amount: weekLoans.reduce((s, l) => s + l.loanAmount, 0) });
      }
    } else {
      const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      months.forEach((m, i) => {
        const monthLoans = allLoans.filter(l => { const start = new Date(l.startDate); return start.getMonth() === i && start.getFullYear() === now.getFullYear(); });
        data.push({ name: m, amount: monthLoans.reduce((s, l) => s + l.loanAmount, 0) });
      });
    }
    return data;
  };

  const chartData = generateChartData(chartPeriod);

  const quickActions = [
    { label: 'Add Customer', icon: UserPlus, path: '/add-customer', bg: 'bg-primary/10' },
    { label: 'Records', icon: Users, path: '/customers', bg: 'bg-accent/10' },
    { label: 'Calculator', icon: Calculator, path: '/calculator', bg: 'bg-success/10 text-success' },
    { label: 'Backup', icon: Database, path: '/backup', bg: 'bg-destructive/10 text-destructive' },
  ];

  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((c) => {
      const loans = c.loans || [];
      const activeLoan = loans.find((l) => l.status !== 'closed');
      const calc = activeLoan ? calculateInterest(activeLoan) : null;
      const status = loans.some((l) => l.status === 'overdue') ? 'Overdue' : loans.some((l) => l.status === 'active') ? 'Active' : 'Closed';
      const daysAgo = activeLoan ? Math.floor((Date.now() - new Date(activeLoan.startDate).getTime()) / 86400000) : 0;
      return { ...c, activeLoan, calc, status, daysAgo };
    });

  const chartPeriodLabels: Record<ChartPeriod, string> = { '7days': '7D', 'month': '1M', 'year': '1Y' };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-sm font-medium tracking-tight text-muted-foreground truncate max-w-[180px]">{appName}</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
              <Bell className="w-5 h-5 text-foreground" />
              {overdueLoans.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5 text-foreground" />
            </Button>
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">{getGreeting()}, {userName} 👋</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-display font-bold text-primary leading-tight">{activeLoans.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active Loans</p>
        </div>
        <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
            <span className="text-sm font-bold text-accent">₹</span>
          </div>
          <p className="text-xl font-display font-bold text-foreground leading-tight">{formatCurrency(totalPrincipal)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Principal Invested</p>
        </div>
        <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-xl font-display font-bold text-success leading-tight">{formatCurrency(totalInterestEarned)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Collected</p>
        </div>
        <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
          {overdueLoans.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />}
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-xl font-display font-bold text-destructive leading-tight">{overdueLoans.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Overdue</p>
          <p className="text-[10px] text-muted-foreground">{formatCurrency(overdueAmount)}</p>
        </div>
      </div>

      {/* Closed This Month */}
      {closedLoans.length > 0 && (
        <div className="px-5 mt-4">
          <div className="bg-foreground rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Closed This Month</p>
                <p className="text-sm font-semibold text-background">{closedLoans.length} settled</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Avg Loan</p>
              <p className="text-lg font-display font-bold text-background">
                {formatCurrency(closedLoans.reduce((s, l) => s + l.loanAmount, 0) / closedLoans.length)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loan Disbursement Chart — responsive period buttons */}
      <div className="px-5 mt-5">
        <div className="glass-card rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-sm sm:text-base font-display font-bold text-foreground">Loan Disbursement</h3>
            <div className="flex gap-1">
              {(['7days', 'month', 'year'] as ChartPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium transition-all ${
                    chartPeriod === p
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {chartPeriodLabels[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="h-44 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} width={35} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-5">
        <h3 className="text-sm font-display font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="flex gap-4">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-foreground text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Customers */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-display font-semibold text-foreground">Recent Customers</h3>
          <button onClick={() => navigate('/customers')} className="text-xs text-primary font-medium">View all</button>
        </div>
        <div className="space-y-2">
          {recentCustomers.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/customer/${c.id}`)}
              className="w-full glass-card rounded-xl p-3 flex items-center gap-3 transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                {c.photo ? (
                  <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-sm text-primary font-display">{c.name.charAt(0)}</span>
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    c.status === 'Overdue' ? 'bg-destructive/10 text-destructive' :
                    c.status === 'Active' ? 'bg-success/10 text-success' :
                    'bg-muted text-muted-foreground'
                  }`}>{c.status}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {c.activeLoan ? `${c.activeLoan.category} · ${c.activeLoan.purity} · ${c.daysAgo}d` : 'No active loans'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-display font-bold text-foreground">
                  {c.activeLoan ? formatCurrency(c.activeLoan.loanAmount) : '—'}
                </p>
                {c.calc && (
                  <p className="text-[10px] text-primary">+{formatCurrency(c.calc.totalInterestDue)} int.</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 ${fabVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <Button
          onClick={() => navigate('/add-customer')}
          className="h-12 px-5 gradient-gold text-primary-foreground font-semibold border-0 hover:opacity-90 shadow-lg rounded-full gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Customer
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
