import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  createAdminManagedUser,
  getAdminDashboard,
  getAdminSettings,
  getAdminUserDetails,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminSettings,
  updateAdminUserStatus,
} from "@/services/adminService";
import AdminHeader from "./components/AdminHeader";
import PlatformControls from "./components/PlatformControls";
import SummaryCards from "./components/SummaryCards";
import UserAccountsSection from "./components/UserAccountsSection";
import UserWorkspace from "./components/UserWorkspace";
import type { AdminSettings, AdminUser, DashboardSummary, UserDetailCustomer } from "./types";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<UserDetailCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [passwordReset, setPasswordReset] = useState("");
  const [settings, setSettings] = useState<AdminSettings>({
    allowRegistrations: true,
    maintenanceMode: false,
    supportEmail: "support@jewelvault.com",
    adminEmail: "admin@jewelvault.com",
  });
  const [adminNote, setAdminNote] = useState(
    "Recommended admin workflow:\n1. Create user accounts from here.\n2. Freeze accounts that need review.\n3. Monitor customer growth and loan exposure."
  );

  const loadPanel = async (searchValue = "") => {
    const [dashboardRes, usersRes, settingsRes] = await Promise.all([
      getAdminDashboard(),
      getAdminUsers(searchValue),
      getAdminSettings(),
    ]);

    setSummary(dashboardRes.data.summary);
    setUsers(usersRes.data);
    setSettings(settingsRes.data);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await loadPanel();
      } catch (err: any) {
        toast.error(err.response?.data?.msg || "Unable to load admin panel");
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPanel(search);
      if (selectedUser?._id) {
        const detailRes = await getAdminUserDetails(selectedUser._id);
        setSelectedUser(detailRes.data.user);
        setSelectedCustomers(detailRes.data.customers);
      }
      toast.success("Admin data refreshed");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    try {
      const res = await getAdminUsers(value);
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Search failed");
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error("Fill all user account fields");
      return;
    }

    try {
      await createAdminManagedUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
      });
      setCreateForm({ name: "", email: "", password: "" });
      await loadPanel(search);
      toast.success("User account created");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to create user");
    }
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const res = await getAdminUserDetails(userId);
      setSelectedUser(res.data.user);
      setSelectedCustomers(res.data.customers);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to load user details");
    }
  };

  const handleToggleFreeze = async (user: AdminUser) => {
    try {
      await updateAdminUserStatus(user._id, user.isFrozen ? "unfreeze" : "freeze");
      await loadPanel(search);
      if (selectedUser?._id === user._id) {
        await handleSelectUser(user._id);
      }
      toast.success(user.isFrozen ? "Account unfrozen" : "Account frozen");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to update account status");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }

    if (passwordReset.trim().length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      await resetAdminUserPassword(selectedUser._id, passwordReset.trim());
      setPasswordReset("");
      toast.success("User password reset successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to reset password");
    }
  };

  const saveSettings = async (nextSettings: AdminSettings) => {
    setSettings(nextSettings);
    try {
      await updateAdminSettings(nextSettings);
      toast.success("Admin settings updated");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to save admin settings");
    }
  };

  const totalPortfolio = useMemo(
    () =>
      selectedCustomers.reduce(
        (sum, customer) =>
          sum +
          customer.loans.reduce(
            (loanSum, loan) => loanSum + (loan.status === "closed" ? 0 : loan.loanAmount || 0),
            0
          ),
        0
      ),
    [selectedCustomers]
  );

  const handleLogout = () => {
    sessionStorage.removeItem("jv_admin_auth");
    sessionStorage.removeItem("jv_admin_token");
    sessionStorage.removeItem("jv_admin_email");
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <AdminHeader refreshing={refreshing} onRefresh={handleRefresh} onLogout={handleLogout} />

      <div className="px-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <SummaryCards summary={summary} />
          <UserAccountsSection
            users={users}
            search={search}
            createForm={createForm}
            onSearch={handleSearch}
            onSelectUser={handleSelectUser}
            onToggleFreeze={handleToggleFreeze}
            onCreateFormChange={setCreateForm}
            onCreateUser={handleCreateUser}
          />
        </div>

        <div className="space-y-5">
          <UserWorkspace
            selectedUser={selectedUser}
            selectedCustomers={selectedCustomers}
            passwordReset={passwordReset}
            totalPortfolio={totalPortfolio}
            onPasswordResetChange={setPasswordReset}
            onResetPassword={handleResetPassword}
          />
          <PlatformControls
            settings={settings}
            adminNote={adminNote}
            onAdminNoteChange={setAdminNote}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
