import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Lock, Clock, Shield, LogOut, ChevronRight, Bell, Database, Store, Image, Moon, Sun, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const clearCustomers = useAppStore((s) => s.clearCustomers);

  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [autoLockMinutes, setAutoLockMinutes] = useState(
    () => parseInt(localStorage.getItem('jv_autolock_minutes') || '5')
  );
  const [backupReminder, setBackupReminder] = useState(
    () => localStorage.getItem('jv_backup_reminder') !== 'false'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem('jv_notifications') !== 'false'
  );

  const [appName, setAppName] = useState(() => localStorage.getItem('jv_app_name') || 'JewelVault');
  const [showAppName, setShowAppName] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jv_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jv_theme', 'light');
    }
  }, [darkMode]);

  const handlePinChange = () => {
    if (currentPin !== (localStorage.getItem('jv_pin') || '1234')) {
      toast.error('Current PIN is incorrect');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast.error('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    localStorage.setItem('jv_pin', newPin);
    toast.success('PIN changed successfully');
    setShowPinChange(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleAutoLockChange = (mins: number) => {
    setAutoLockMinutes(mins);
    localStorage.setItem('jv_autolock_minutes', mins.toString());
    toast.success(`Auto-lock set to ${mins} minutes`);
  };

  const handleAppNameSave = () => {
    if (!appName.trim()) {
      toast.error('App name cannot be empty');
      return;
    }
    localStorage.setItem('jv_app_name', appName.trim());
    toast.success('App name updated');
    setShowAppName(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem('jv_app_logo', reader.result as string);
      toast.success('Logo updated — refresh to see changes on dashboard');
      setShowLogoUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearCustomers();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('jv_user_name');
    localStorage.removeItem('jv_user_email');
    logout();
    navigate('/');
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: UserCircle2,
          label: 'Profile',
          description: 'Change your username and login password',
          action: () => navigate('/profile'),
          chevron: true,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: 'Dark Mode',
          description: darkMode ? 'Dark gold/black theme active' : 'Light gold/cream theme active',
          custom: (
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          ),
        },
      ],
    },
    {
      title: 'Branding',
      items: [
        {
          icon: Store,
          label: 'App Name',
          description: `Current: ${appName}`,
          action: () => setShowAppName(!showAppName),
          chevron: true,
          expandContent: showAppName ? (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2">
              <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Your shop name" className="h-11" />
              <Button onClick={handleAppNameSave} className="w-full gradient-gold text-primary-foreground">Save Name</Button>
            </div>
          ) : null,
        },
        {
          icon: Image,
          label: 'App Logo',
          description: 'Change the logo shown on dashboard',
          action: () => setShowLogoUpload(!showLogoUpload),
          chevron: true,
          expandContent: showLogoUpload ? (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2">
              <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm text-muted-foreground" />
            </div>
          ) : null,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: Lock,
          label: 'Change PIN',
          description: 'Update your 4-digit login PIN',
          action: () => setShowPinChange(!showPinChange),
          chevron: true,
          expandContent: showPinChange ? (
            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2">
              <Input type="password" maxLength={4} placeholder="Current PIN" value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))} className="text-center tracking-[0.5em] font-mono" />
              <Input type="password" maxLength={4} placeholder="New PIN" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} className="text-center tracking-[0.5em] font-mono" />
              <Input type="password" maxLength={4} placeholder="Confirm New PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} className="text-center tracking-[0.5em] font-mono" />
              <Button onClick={handlePinChange} className="w-full gradient-gold text-primary-foreground">Update PIN</Button>
            </div>
          ) : null,
        },
        {
          icon: Clock,
          label: 'Auto-Lock Timer',
          description: `Lock after ${autoLockMinutes} min of inactivity`,
          custom: (
            <div className="flex gap-1">
              {[1, 3, 5, 10].map((m) => (
                <button
                  key={m}
                  onClick={() => handleAutoLockChange(m)}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
                    autoLockMinutes === m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          ),
        },
        {
          icon: Shield,
          label: 'Biometric Login',
          description: 'Fingerprint/face (if supported)',
          custom: <Switch checked={false} disabled className="opacity-50" />,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Alerts for overdue & due-today loans',
          custom: (
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={(v) => {
                setNotificationsEnabled(v);
                localStorage.setItem('jv_notifications', v.toString());
                toast.success(v ? 'Notifications enabled' : 'Notifications disabled');
              }}
            />
          ),
        },
        {
          icon: Database,
          label: 'Backup Reminders',
          description: 'Periodic reminders to backup data',
          custom: (
            <Switch
              checked={backupReminder}
              onCheckedChange={(v) => {
                setBackupReminder(v);
                localStorage.setItem('jv_backup_reminder', v.toString());
                toast.success(v ? 'Backup reminders on' : 'Backup reminders off');
              }}
            />
          ),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: Database,
          label: 'Backup & Restore',
          description: 'Export or import your data',
          action: () => navigate('/backup'),
          chevron: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {settingSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              {section.title}
            </h3>
            <div className="glass-card rounded-xl overflow-hidden divide-y divide-border">
              {section.items.map((item: any) => (
                <div key={item.label}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                    disabled={!item.action && !item.custom}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                    {item.custom && <div onClick={(e) => e.stopPropagation()}>{item.custom}</div>}
                    {item.chevron && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>
                  {item.expandContent}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full glass-card rounded-xl p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium">Sign Out</span>
            <p className="text-[10px] text-muted-foreground">You can sign in again with Google or Email</p>
          </div>
        </button>

        <p className="text-center text-[10px] text-muted-foreground pb-4">
          {appName} v1.0 • Built with ❤️
        </p>
      </div>
    </div>
  );
};

export default Settings;
