import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Customer, Loan } from '@/lib/types';
import { calculateInterest, formatCurrency } from '@/lib/interest';
import { MessageSquare, Phone, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ReminderDialogProps {
  customer: Customer;
  loan: Loan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Lang = 'english' | 'hindi' | 'marathi';

const ReminderDialog = ({ customer, loan, open, onOpenChange }: ReminderDialogProps) => {
  const calc = calculateInterest(loan);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Lang>('english');

  const appName = localStorage.getItem('jv_app_name') || 'JewelVault';

  const templates: Record<Lang, string> = {
    english: `Dear ${customer.name},\n\nThis is a reminder regarding your jewellery loan at ${appName}.\n\n📋 Loan Details:\n• Item: ${loan.itemName} (${loan.purity})\n• Principal: ${formatCurrency(loan.loanAmount)}\n• Interest Due: ${formatCurrency(calc.totalInterestDue)}\n• Total Pending: ${formatCurrency(calc.pendingAmount)}\n\n📅 Loan started: ${new Date(loan.startDate).toLocaleDateString('en-IN')}\n⏳ Duration: ${calc.monthsElapsed} months\n\nPlease visit the shop to make your payment at the earliest.\n\nThank you,\n${appName}`,
    hindi: `प्रिय ${customer.name},\n\n${appName} पर आपके ज्वेलरी लोन के बारे में यह एक रिमाइंडर है।\n\n📋 लोन विवरण:\n• आइटम: ${loan.itemName} (${loan.purity})\n• मूलधन: ${formatCurrency(loan.loanAmount)}\n• ब्याज देय: ${formatCurrency(calc.totalInterestDue)}\n• कुल बकाया: ${formatCurrency(calc.pendingAmount)}\n\n📅 लोन शुरू: ${new Date(loan.startDate).toLocaleDateString('hi-IN')}\n⏳ अवधि: ${calc.monthsElapsed} महीने\n\nकृपया जल्द से जल्द दुकान पर आकर भुगतान करें।\n\nधन्यवाद,\n${appName}`,
    marathi: `प्रिय ${customer.name},\n\n${appName} वरील आपल्या ज्वेलरी कर्जाबद्दल ही एक स्मरणपत्र आहे.\n\n📋 कर्ज तपशील:\n• वस्तू: ${loan.itemName} (${loan.purity})\n• मूळ रक्कम: ${formatCurrency(loan.loanAmount)}\n• व्याज देय: ${formatCurrency(calc.totalInterestDue)}\n• एकूण बाकी: ${formatCurrency(calc.pendingAmount)}\n\n📅 कर्ज सुरू: ${new Date(loan.startDate).toLocaleDateString('mr-IN')}\n⏳ कालावधी: ${calc.monthsElapsed} महिने\n\nकृपया लवकरात लवकर दुकानात येऊन पैसे भरा.\n\nधन्यवाद,\n${appName}`,
  };

  const [message, setMessage] = useState(templates[lang]);

  const switchLang = (newLang: Lang) => {
    setLang(newLang);
    setMessage(templates[newLang]);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Message copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSMS = () => {
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, '_blank');
  };

  const langLabels: Record<Lang, string> = { english: 'English', hindi: 'हिंदी', marathi: 'मराठी' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Send Reminder</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {/* Language selector */}
          <div className="flex gap-1">
            {(['english', 'hindi', 'marathi'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  lang === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[200px] text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={handleCopy} className="text-xs gap-1">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy
            </Button>
            <Button onClick={handleWhatsApp} className="bg-success hover:bg-success/90 text-success-foreground text-xs gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </Button>
            <Button onClick={handleSMS} variant="outline" className="text-xs gap-1">
              <Phone className="w-3.5 h-3.5" />
              SMS
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDialog;
