import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'admin@jewelvault.com';
const ADMIN_PASSWORD = 'admin@1234';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('jv_admin_auth', 'true');
        toast.success('Admin access granted');
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-4" disabled={loading}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Restricted area — authorized only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Admin Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@jewelvault.com"
                className="pl-10 h-11"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Admin Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground disabled:opacity-50">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-xs text-center">{error}</p>}

          <Button
            type="submit"
            loading={loading}
            loadingText="Authorizing Access..."
            className="w-full h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            Sign In as Admin
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          This panel is for app administrators only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
