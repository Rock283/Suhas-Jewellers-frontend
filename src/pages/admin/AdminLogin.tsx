import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/services/adminService";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin({
        email: email.trim(),
        password,
      });

      sessionStorage.setItem("jv_admin_auth", "true");
      sessionStorage.setItem("jv_admin_token", res.data.token);
      sessionStorage.setItem("jv_admin_email", res.data.admin.email);
      toast.success("Admin access granted");
      navigate("/admin");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Use the special administrator credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Admin Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="admin@jewelvault.com"
                className="pl-10 h-11"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Admin Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter administrator password"
                className="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-xs text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {loading ? "Checking..." : "Sign In as Admin"}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in backend env if you want different credentials.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
