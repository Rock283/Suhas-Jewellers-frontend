import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Gem } from 'lucide-react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const PinLock = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const login = useAuth((s) => s.login);
  const logout = useAuth((s) => s.logout);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const lockApp = useCallback(() => {
    if (isAuthenticated) {
      setLocked(true);
      setPin('');
      setError('');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocked(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(lockApp, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, lockApp]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      setLocked(false);
      setPin('');
    } else {
      setError('Wrong PIN');
      setPin('');
    }
  };

  if (!locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-1">App Locked</h2>
        <p className="text-sm text-muted-foreground font-body mb-6">Enter PIN to unlock</p>
        <form onSubmit={handleUnlock} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            className="h-12 text-center text-lg tracking-[0.3em] font-body"
            maxLength={6}
            autoFocus
          />
          {error && <p className="text-destructive text-sm font-body">{error}</p>}
          <Button type="submit" className="w-full h-12 gradient-gold text-primary-foreground font-semibold border-0 hover:opacity-90">
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PinLock;
