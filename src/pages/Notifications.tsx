import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { calculateInterest, formatCurrency } from '@/lib/interest';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, Bell, MessageSquare } from 'lucide-react';

interface Notification {
  id: string;
  type: 'overdue' | 'due_today' | 'payment' | 'reminder';
  title: string;
  message: string;
  time: string;
  customerId: string;
  read: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const customers = useAppStore((s) => s.customers);

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const now = new Date();

    customers.forEach((c) => {
      c.loans.forEach((loan) => {
        if (loan.status === 'closed') return;
        const calc = calculateInterest(loan);
        const startDate = new Date(loan.startDate);
        const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / 86400000);

        if (loan.status === 'overdue' || (calc.monthsElapsed > 0 && calc.totalPaid < calc.totalInterestDue * 0.5)) {
          notifs.push({
            id: `overdue-${loan.id}`, type: 'overdue',
            title: `⚠️ Overdue: ${c.name}`,
            message: `${loan.itemName} — ${formatCurrency(calc.pendingAmount)} pending. ${calc.monthsElapsed} months.`,
            time: getTimeAgo(daysSinceStart), customerId: c.id, read: false,
          });
        }

        const dayOfMonth = startDate.getDate();
        if (now.getDate() === dayOfMonth && loan.status === 'active') {
          notifs.push({
            id: `due-${loan.id}`, type: 'due_today',
            title: `🔔 Due Today: ${c.name}`,
            message: `Monthly interest ${formatCurrency(calc.monthlyInterest)} for ${loan.itemName}.`,
            time: 'Today', customerId: c.id, read: false,
          });
        }

        loan.payments.slice(-2).forEach((p) => {
          const daysAgo = Math.floor((now.getTime() - new Date(p.date).getTime()) / 86400000);
          if (daysAgo <= 7) {
            notifs.push({
              id: `payment-${p.id}`, type: 'payment',
              title: `✅ Payment: ${c.name}`,
              message: `${formatCurrency(p.amount)} ${p.type} for ${loan.itemName}.`,
              time: getTimeAgo(daysAgo), customerId: c.id, read: true,
            });
          }
        });

        if (calc.monthsElapsed >= 10 && calc.monthsElapsed <= 12 && loan.status === 'active') {
          notifs.push({
            id: `compound-${loan.id}`, type: 'reminder',
            title: `📢 Compound Alert: ${c.name}`,
            message: `${loan.itemName} is ${calc.monthsElapsed}mo old. Compound starts at 12mo.`,
            time: `${12 - calc.monthsElapsed}mo left`, customerId: c.id, read: false,
          });
        }
      });
    });

    const priority = { overdue: 0, due_today: 1, reminder: 2, payment: 3 };
    return notifs.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return priority[a.type] - priority[b.type];
    });
  }, [customers]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'due_today': return <Clock className="w-4 h-4 text-primary" />;
      case 'payment': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'reminder': return <Bell className="w-4 h-4 text-accent" />;
    }
  };

  const getBg = (type: Notification['type']) => {
    switch (type) {
      case 'overdue': return 'bg-destructive/10';
      case 'due_today': return 'bg-primary/10';
      case 'payment': return 'bg-success/10';
      case 'reminder': return 'bg-accent/10';
    }
  };

  const sendWhatsApp = (notif: Notification) => {
    const customer = customers.find(c => c.id === notif.customerId);
    if (!customer) return;
    const msg = encodeURIComponent(`Hi ${customer.name}, ${notif.message}`);
    window.open(`https://wa.me/91${customer.phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Notifications</h1>
            <p className="text-[10px] text-muted-foreground">{notifications.filter(n => !n.read).length} unread</p>
          </div>
        </div>
      </div>

      <div className="px-5 grid grid-cols-3 gap-2 mb-4">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto mb-1">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-lg font-display font-bold text-foreground">{notifications.filter(n => n.type === 'overdue').length}</p>
          <p className="text-[10px] text-muted-foreground">Overdue</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-lg font-display font-bold text-foreground">{notifications.filter(n => n.type === 'due_today').length}</p>
          <p className="text-[10px] text-muted-foreground">Due Today</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-lg font-display font-bold text-foreground">{notifications.filter(n => n.type === 'payment').length}</p>
          <p className="text-[10px] text-muted-foreground">Payments</p>
        </div>
      </div>

      <div className="px-5 space-y-2">
        {notifications.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`glass-card rounded-xl p-3 flex gap-3 ${!notif.read ? 'border-l-2 border-l-primary' : 'opacity-80'}`}>
              <div className={`w-9 h-9 rounded-lg ${getBg(notif.type)} flex items-center justify-center shrink-0 mt-0.5`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground leading-tight">{notif.title}</p>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0">{notif.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{notif.message}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => navigate(`/customer/${notif.customerId}`)} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    View
                  </button>
                  {(notif.type === 'overdue' || notif.type === 'due_today') && (
                    <button onClick={() => sendWhatsApp(notif)} className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 text-success font-medium flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Remind
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function getTimeAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default Notifications;
