import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Download, Upload, FileJson, FileSpreadsheet, AlertTriangle, Clock, Cloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { restoreBackup } from '@/services/backupService';
import { getCustomers } from '@/services/customerService';

const BackupRestore = () => {
  const navigate = useNavigate();
  const customers = useAppStore((s) => s.customers);
  const setCustomers = useAppStore((s) => s.setCustomers);

  const [autoBackup, setAutoBackup] = useState(() => localStorage.getItem('jv_auto_backup') || 'off');
  const [syncEnabled, setSyncEnabled] = useState(() => localStorage.getItem('jv_sync') === 'true');

  const exportJSON = () => {
    const data = JSON.stringify({ customers, exportedAt: new Date().toISOString(), version: '1.0' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jewelvault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem('lastBackup', new Date().toLocaleString('en-IN'));
    toast.success('JSON backup downloaded');
  };

  const exportExcel = () => {
    const rows = [['Customer', 'Phone', 'Item', 'Category', 'Purity', 'Weight(g)', 'Loan Amount', 'Interest Rate', 'Status', 'Start Date']];
    customers.forEach((c) => {
      c.loans.forEach((l) => {
        rows.push([c.name, c.phone, l.itemName, l.category, l.purity, l.weightGrams.toString(), l.loanAmount.toString(), l.interestRate.toString(), l.status, l.startDate]);
      });
      if (c.loans.length === 0) rows.push([c.name, c.phone, '', '', '', '', '', '', '', '']);
    });
    const csv = '\ufeff' + rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jewelvault-data-${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Excel export downloaded');
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error(`File too large. Maximum size is 100MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.customers && Array.isArray(data.customers)) {
            // Show confirmation dialog
            const confirmed = window.confirm(
              `⚠️ WARNING: This will REPLACE all your current data!\n\n` +
              `Importing: ${data.customers.length} customers\n` +
              `Total loans: ${data.customers.reduce((sum, c) => sum + (c.loans?.length || 0), 0)}\n\n` +
              `This action cannot be undone. Continue?`
            );

            if (!confirmed) {
              toast.info('Restore cancelled');
              return;
            }

            // Show loading state
            toast.loading('Restoring backup...', { id: 'restore' });

            // Call restore API
            const restoreResponse = await restoreBackup({ customers: data.customers });

            if (restoreResponse.status === 200) {
              // Refresh frontend state
              const customersRes = await getCustomers();
              const restoredCustomers = customersRes.data || [];

              // Update store
              setCustomers(restoredCustomers);

              // Use actual restored counts from backend response
              const { restored } = restoreResponse.data;
              const totalLoans = restored?.loans || restoredCustomers.reduce((sum, customer) => sum + customer.loans.length, 0);
              const totalPayments = restored?.payments || restoredCustomers.reduce((sum, customer) =>
                sum + customer.loans.reduce((loanSum, loan) => loanSum + loan.payments.length, 0), 0
              );

              toast.success(`Backup restored successfully! ${restored?.customers || restoredCustomers.length} customers, ${totalLoans} loans, ${totalPayments} payments`, { id: 'restore' });
            } else {
              toast.error('Failed to restore backup', { id: 'restore' });
            }
          } else {
            toast.error('Invalid backup file format. Expected { customers: [...] } structure');
          }
        } catch (err: any) {
          console.error('Restore error', err);
          const errorMessage = err.response?.data?.msg || err.response?.data?.error || err.message || 'Failed to restore backup';
          toast.error(`Restore failed: ${errorMessage}`, { id: 'restore' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleAutoBackupChange = (schedule: string) => {
    setAutoBackup(schedule);
    localStorage.setItem('jv_auto_backup', schedule);
    toast.success(schedule === 'off' ? 'Auto backup disabled' : `Auto backup set to ${schedule}`);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Backup & Restore</h1>
        </div>

        <div className="space-y-4">
          {/* Export */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-1">Export Data</h3>
            <p className="text-[11px] text-muted-foreground mb-4">Download your data for safekeeping</p>
            <div className="space-y-3">
              <Button onClick={exportJSON} variant="outline" className="w-full h-12 gap-2 justify-start">
                <FileJson className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">Export as JSON</p>
                  <p className="text-[10px] text-muted-foreground">Full backup — restorable</p>
                </div>
              </Button>
              <Button onClick={exportExcel} variant="outline" className="w-full h-12 gap-2 justify-start">
                <FileSpreadsheet className="w-5 h-5 text-success" />
                <div className="text-left">
                  <p className="text-sm font-medium">Export as Excel</p>
                  <p className="text-[10px] text-muted-foreground">Open in Excel or Sheets</p>
                </div>
              </Button>
            </div>
          </div>

          {/* Auto Backup Schedule */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-display font-semibold text-foreground">Auto Backup Schedule</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">Set automatic backup frequency</p>
            <div className="flex gap-2">
              {['off', 'daily', 'monthly', 'yearly'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAutoBackupChange(opt)}
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors capitalize ${
                    autoBackup === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Cloud Sync */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-display font-semibold text-foreground">Cloud Sync</h3>
              </div>
              <Switch
                checked={syncEnabled}
                onCheckedChange={(v) => {
                  setSyncEnabled(v);
                  localStorage.setItem('jv_sync', v.toString());
                  toast.success(v ? 'Cloud sync enabled' : 'Cloud sync disabled');
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Sync data across multiple devices in real-time</p>
            {syncEnabled && (
              <div className="bg-success/5 rounded-lg p-3 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-success" />
                <p className="text-[11px] text-success font-medium">Multi-device sync active — login on any device</p>
              </div>
            )}
          </div>

          {/* Restore */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-1">Restore Data</h3>
            <p className="text-[11px] text-muted-foreground mb-4">Import from a JSON backup file</p>
            <div className="bg-destructive/5 rounded-lg p-3 flex items-start gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] text-destructive">This will replace all current data. Export first!</p>
            </div>
            <Button onClick={handleRestore} variant="outline" className="w-full h-12 gap-2">
              <Upload className="w-5 h-5" />
              Import JSON Backup
            </Button>
          </div>

          {/* Stats */}
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Last backup:</strong> {localStorage.getItem('lastBackup') || 'Never'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground">Records:</strong> {customers.length} customers, {customers.flatMap(c => c.loans).length} loans
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground">Auto backup:</strong> {autoBackup === 'off' ? 'Disabled' : autoBackup}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
