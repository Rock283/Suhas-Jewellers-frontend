import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import PinLock from "@/components/PinLock";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import CustomerDetail from "./pages/CustomerDetail";
import AddLoan from "./pages/AddLoan";
import Reports from "./pages/Reports";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSettings from "./pages/admin/AdminSettings";
import InterestCalculator from "./pages/InterestCalculator";
import BackupRestore from "./pages/BackupRestore";
import AdminPanel from "./pages/admin/AdminPanel";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import { getAdminSession } from "./services/adminService";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    const verifyAdmin = async () => {
      const hasToken = !!sessionStorage.getItem("jv_admin_token");
      const hasFlag = sessionStorage.getItem("jv_admin_auth") === "true";

      if (!hasToken || !hasFlag) {
        setStatus("blocked");
        return;
      }

      try {
        await getAdminSession();
        setStatus("allowed");
      } catch {
        sessionStorage.removeItem("jv_admin_auth");
        sessionStorage.removeItem("jv_admin_token");
        sessionStorage.removeItem("jv_admin_email");
        setStatus("blocked");
      }
    };

    verifyAdmin();
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (status === "blocked") return <Navigate to="/admin-login" replace />;
  return <>{children}</>;
};

const AdminLoginRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "show_login" | "redirect_admin">("checking");

  useEffect(() => {
    const verifyAdmin = async () => {
      const hasToken = !!sessionStorage.getItem("jv_admin_token");
      const hasFlag = sessionStorage.getItem("jv_admin_auth") === "true";

      if (!hasToken || !hasFlag) {
        setStatus("show_login");
        return;
      }

      try {
        await getAdminSession();
        setStatus("redirect_admin");
      } catch {
        sessionStorage.removeItem("jv_admin_auth");
        sessionStorage.removeItem("jv_admin_token");
        sessionStorage.removeItem("jv_admin_email");
        setStatus("show_login");
      }
    };

    verifyAdmin();
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (status === "redirect_admin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const AuthListener = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        localStorage.setItem('jv_user_name', name);
        localStorage.setItem('jv_user_email', session.user.email || '');
        useAuth.setState({ isAuthenticated: true });
      } else if (event === 'SIGNED_OUT') {
        useAuth.setState({ isAuthenticated: false });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        localStorage.setItem('jv_user_name', name);
        localStorage.setItem('jv_user_email', session.user.email || '');
        useAuth.setState({ isAuthenticated: true });
      }
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthListener>
          <PinLock>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
              <Route path="/customer/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
              <Route path="/add-loan/:customerId" element={<ProtectedRoute><AddLoan /></ProtectedRoute>} />
              <Route path="/edit-loan/:customerId/:loanId" element={<ProtectedRoute><AddLoan /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/calculator" element={<ProtectedRoute><InterestCalculator /></ProtectedRoute>} />
              <Route path="/backup" element={<ProtectedRoute><BackupRestore /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin-login" element={<AdminLoginRoute><AdminLogin /></AdminLoginRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PinLock>
        </AuthListener>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
