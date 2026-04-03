import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gem, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useAppStore } from "@/lib/store";

// ✅ API IMPORTS
import { loginUser, registerUser } from "@/services/authService";
import { getCustomers } from "@/services/customerService";

type AuthMode = "signin" | "signup";

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setCustomers = useAppStore((s) => s.setCustomers);

  // ✅ UPDATED AUTH FUNCTION - LOADS USER DATA AFTER LOGIN
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await registerUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        });

        toast.success("Account created successfully!");
        setMode("signin"); // switch to login after signup
      } else {
        const res = await loginUser({
          email: email.trim(),
          password: password.trim(),
        });

        // ✅ Save token + user
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("jv_user_name", res.data.user?.name || "User");
        localStorage.setItem("jv_user_email", res.data.user?.email || email.trim());

        // ✅ LOAD USER'S CUSTOMERS
        const customersRes = await getCustomers();
        setCustomers(customersRes.data || []);

        useAuth.setState({ isAuthenticated: true });

        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mb-4 shadow-lg">
            <Gem className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">JewelVault</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Jewellery Loan Management
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${
              mode === "signin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* 🚫 Google disabled */}
        <Button disabled className="w-full h-12 mb-4">
          Google Login (Coming Soon)
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* FORM */}
        <form onSubmit={handleEmailAuth} className="space-y-4">

          {/* Name */}
          {mode === "signup" && (
            <div>
              <Label className="text-xs">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <Label className="text-xs">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label className="text-xs">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs text-center">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 gradient-gold"
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
