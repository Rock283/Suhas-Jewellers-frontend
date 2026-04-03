import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, calculateInterest } from '@/lib/interest';
import { TrendingUp, Users, AlertTriangle, PieChart, FileSpreadsheet, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

type ExportFrequency = 'weekly' | 'monthly' | 'yearly' | 'custom';

const Reports = () => {
  const customers = useAppStore((s) => s.customers);
  const navigate = useNavigate();
  const [exportFreq, setExportFreq] = useState<ExportFrequency>('custom');

  const allLoans = customers.flatMap((c) => c.loans);
  const activeLoans = allLoans.filter((l) => l.status === 'active');
  const overdueLoans = allLoans.filter((l) => l.status === 'overdue');
  const closedLoans = allLoans.filter((l) => l.status === 'closed');

  const totalPrincipal = [...activeLoans, ...overdueLoans].reduce((s, l) => s + l.loanAmount, 0);
  const totalInterest = allLoans.reduce((s, l) => s + calculateInterest(l).totalInterestDue, 0);
  const totalPaid = allLoans.reduce((s, l) => s + calculateInterest(l).totalPaid, 0);
  const totalPending = allLoans.reduce((s, l) => s + calculateInterest(l).pendingAmount, 0);

  const goldLoans = allLoans.filter(l => l.category === 'gold' && l.status !== 'closed');
  const silverLoans = allLoans.filter(l => l.category === 'silver' && l.status !== 'closed');
  const goldTotal = goldLoans.reduce((s, l) => s + l.loanAmount, 0);
  const silverTotal = silverLoans.reduce((s, l) => s + l.loanAmount, 0);

  const formatExportCurrency = (amount: number) =>
    `Rs. ${Math.round(amount).toLocaleString('en-IN')}`;

  const reports = [
    { label: 'Total Customers', value: customers.length.toString(), icon: Users, color: 'text-primary' },
    { label: 'Active Loans', value: activeLoans.length.toString(), icon: TrendingUp, color: 'text-success' },
    { label: 'Overdue Loans', value: overdueLoans.length.toString(), icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Closed Loans', value: closedLoans.length.toString(), icon: PieChart, color: 'text-muted-foreground' },
  ];

  const getFilteredCustomers = () => {
    if (exportFreq === 'custom') return customers;
    const now = new Date();
    let cutoff = new Date();
    if (exportFreq === 'weekly') cutoff.setDate(now.getDate() - 7);
    else if (exportFreq === 'monthly') cutoff.setMonth(now.getMonth() - 1);
    else if (exportFreq === 'yearly') cutoff.setFullYear(now.getFullYear() - 1);

    return customers.map(c => ({
      ...c,
      loans: c.loans.filter(l => new Date(l.startDate) >= cutoff)
    })).filter(c => c.loans.length > 0);
  };

  const exportExcel = () => {
    const filtered = getFilteredCustomers();
    const rows = [['Customer', 'Phone', 'Item', 'Category', 'Purity', 'Weight(g)', 'Loan Amount', 'Interest Rate', 'Status', 'Start Date', 'Interest Due', 'Total Paid', 'Pending']];
    filtered.forEach((c) => {
      c.loans.forEach((l) => {
        const calc = calculateInterest(l);
        rows.push([c.name, c.phone, l.itemName, l.category, l.purity, l.weightGrams.toString(), l.loanAmount.toString(), l.interestRate.toString(), l.status, l.startDate, calc.totalInterestDue.toString(), calc.totalPaid.toString(), calc.pendingAmount.toString()]);
      });
    });
    const csv = '\ufeff' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jewelvault-report-${exportFreq}-${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Excel report downloaded');
  };

  const exportPDF = () => {
    const filtered = getFilteredCustomers();
    const filteredLoans = filtered.flatMap(c => c.loans);
    const fTotalPrincipal = filteredLoans.filter(l => l.status !== 'closed').reduce((s, l) => s + l.loanAmount, 0);
    const fTotalInterest = filteredLoans.reduce((s, l) => s + calculateInterest(l).totalInterestDue, 0);
    const fTotalPaid = filteredLoans.reduce((s, l) => s + calculateInterest(l).totalPaid, 0);
    const fTotalPending = filteredLoans.reduce((s, l) => s + calculateInterest(l).pendingAmount, 0);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>JewelVault Report</title><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{color:#B8860B;border-bottom:2px solid #B8860B;padding-bottom:10px}
      h2{color:#555;margin-top:30px}
      table{width:100%;border-collapse:collapse;margin:15px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
      th{background:#f5f0e8;color:#333;font-weight:600}
      .summary{display:flex;gap:20px;margin:20px 0}
      .stat{background:#f9f6f0;padding:15px;border-radius:8px;flex:1;text-align:center}
      .stat h3{font-size:24px;color:#B8860B;margin:0}
      .stat p{color:#888;font-size:12px;margin:4px 0 0}
      .overdue{color:#e53e3e}
    </style></head><body>
    <h1>JewelVault Report (${exportFreq === 'custom' ? 'All Time' : exportFreq})</h1>
    <p>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <div class="summary">
      <div class="stat"><h3>${filtered.length}</h3><p>Customers</p></div>
      <div class="stat"><h3>${filteredLoans.filter(l => l.status === 'active').length}</h3><p>Active</p></div>
      <div class="stat"><h3 class="overdue">${filteredLoans.filter(l => l.status === 'overdue').length}</h3><p>Overdue</p></div>
      <div class="stat"><h3>${filteredLoans.filter(l => l.status === 'closed').length}</h3><p>Closed</p></div>
    </div>
    <h2>Financial Summary</h2>
    <table><tr><th>Metric</th><th>Amount</th></tr>
    <tr><td>Total Principal</td><td>${formatExportCurrency(fTotalPrincipal)}</td></tr>
    <tr><td>Total Interest Accrued</td><td>${formatExportCurrency(fTotalInterest)}</td></tr>
    <tr><td>Total Collected</td><td>${formatExportCurrency(fTotalPaid)}</td></tr>
    <tr><td><strong>Total Outstanding</strong></td><td><strong>${formatExportCurrency(fTotalPending)}</strong></td></tr></table>
    <h2>Detailed Records</h2>
    <table><tr><th>Customer</th><th>Phone</th><th>Item</th><th>Purity</th><th>Loan</th><th>Rate</th><th>Status</th><th>Pending</th></tr>
    ${filtered.flatMap(c => c.loans.map(l => {
      const calc = calculateInterest(l);
      return `<tr><td>${c.name}</td><td>${c.phone}</td><td>${l.itemName}</td><td>${l.purity}</td><td>${formatExportCurrency(l.loanAmount)}</td><td>${l.interestRate}%</td><td${l.status === 'overdue' ? ' class="overdue"' : ''}>${l.status}</td><td>${formatExportCurrency(calc.pendingAmount)}</td></tr>`;
    })).join('')}
    </table></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) setTimeout(() => w.print(), 500);
    toast.success('PDF report opened — use Print > Save as PDF');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-10 pb-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Reports</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {reports.map((r) => (
            <div key={r.label} className="glass-card rounded-xl p-4">
              <r.icon className={`w-5 h-5 ${r.color} mb-2`} />
              <p className="text-2xl font-display font-bold text-foreground">{r.value}</p>
              <p className="text-[11px] text-muted-foreground">{r.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Principal</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(totalPrincipal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Interest Accrued</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Total Collected</span>
              <span className="text-sm font-bold text-success">{formatCurrency(totalPaid)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-foreground">Outstanding</span>
              <span className="text-sm font-bold text-destructive">{formatCurrency(totalPending)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Loan Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Gold ({goldLoans.length})</span>
                <span className="font-medium text-foreground">{formatCurrency(goldTotal)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${totalPrincipal > 0 ? (goldTotal / totalPrincipal) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Silver ({silverLoans.length})</span>
                <span className="font-medium text-foreground">{formatCurrency(silverTotal)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${totalPrincipal > 0 ? (silverTotal / totalPrincipal) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Export Section with frequency */}
        <div className="glass-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Export Reports</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Choose time range for export</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              { key: 'weekly', label: 'Last 7 Days' },
              { key: 'monthly', label: 'Last Month' },
              { key: 'yearly', label: 'Last Year' },
              { key: 'custom', label: 'All Time' },
            ] as { key: ExportFrequency; label: string }[]).map((freq) => (
              <button
                key={freq.key}
                onClick={() => setExportFreq(freq.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  exportFreq === freq.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={exportExcel} className="h-12 text-xs gap-2">
              <FileSpreadsheet className="w-4 h-4 text-success" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={exportPDF} className="h-12 text-xs gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Reports;
