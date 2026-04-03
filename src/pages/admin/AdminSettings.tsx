import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, Settings2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getAdminSettings, updateAdminSettings } from "@/services/adminService";
import type { AdminSettings as AdminSettingsType } from "./types";

const defaultSettings: AdminSettingsType = {
  allowRegistrations: true,
  maintenanceMode: false,
  supportEmail: "support@jewelvault.com",
  adminEmail: "admin@jewelvault.com",
};

const AdminSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AdminSettingsType>(defaultSettings);
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getAdminSettings();
        setSettings({
          allowRegistrations: res.data.allowRegistrations ?? true,
          maintenanceMode: res.data.maintenanceMode ?? false,
          supportEmail: res.data.supportEmail ?? "support@jewelvault.com",
          adminEmail: res.data.adminEmail ?? "admin@jewelvault.com",
        });
      } catch (err: any) {
        toast.error(err.response?.data?.msg || "Unable to load admin settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleGeneralSave = async () => {
    setSavingGeneral(true);
    try {
      const res = await updateAdminSettings(settings);
      const next = res.data.settings;
      setSettings({
        allowRegistrations: next.allowRegistrations ?? true,
        maintenanceMode: next.maintenanceMode ?? false,
        supportEmail: next.supportEmail ?? "support@jewelvault.com",
        adminEmail: next.adminEmail ?? "admin@jewelvault.com",
      });
      sessionStorage.setItem("jv_admin_email", next.adminEmail ?? settings.adminEmail);
      toast.success("Admin settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to save admin settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentAdminPassword || !newAdminPassword) {
      toast.error("Fill both password fields");
      return;
    }

    setSavingPassword(true);
    try {
      await updateAdminSettings({
        currentAdminPassword,
        newAdminPassword,
      });
      setCurrentAdminPassword("");
      setNewAdminPassword("");
      toast.success("Admin password updated");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to update admin password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Admin Settings</h1>
            <p className="text-[11px] text-muted-foreground">Manage admin credentials and platform controls</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5">
        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  className="pl-10"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings((current) => ({ ...current, adminEmail: e.target.value }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">This email will be used for future admin logins.</p>
            </div>

            <Button onClick={handleGeneralSave} disabled={loading || savingGeneral} className="gradient-gold text-primary-foreground">
              {savingGeneral ? "Saving..." : "Save Admin Email"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Change Admin Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-admin-password">Current Password</Label>
              <Input
                id="current-admin-password"
                type="password"
                value={currentAdminPassword}
                onChange={(e) => setCurrentAdminPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-admin-password">New Password</Label>
              <Input
                id="new-admin-password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
              />
            </div>

            <Button onClick={handlePasswordSave} disabled={loading || savingPassword}>
              {savingPassword ? "Updating..." : "Update Admin Password"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              Platform Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Allow New Registrations</p>
                <p className="text-[11px] text-muted-foreground">Control whether new users can self-register</p>
              </div>
              <Switch
                checked={settings.allowRegistrations}
                onCheckedChange={(checked) => setSettings((current) => ({ ...current, allowRegistrations: checked }))}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-[11px] text-muted-foreground">Block user access during planned maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings((current) => ({ ...current, maintenanceMode: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings((current) => ({ ...current, supportEmail: e.target.value }))}
              />
            </div>

            <Button onClick={handleGeneralSave} disabled={loading || savingGeneral}>
              {savingGeneral ? "Saving..." : "Save Platform Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
