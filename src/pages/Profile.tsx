import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, KeyRound, Mail, Shield, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProfile as fetchProfile,
  updatePassword as savePassword,
  updateProfile as saveProfile,
} from "@/services/authService";

type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchProfile();
        const profile = res.data as ProfileUser;
        setUser(profile);
        setName(profile.name || "");
        localStorage.setItem("user", JSON.stringify(profile));
        localStorage.setItem("jv_user_name", profile.name || "");
        localStorage.setItem("jv_user_email", profile.email || "");
      } catch (err: any) {
        toast.error(err.response?.data?.msg || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "Recently joined";
    try {
      return format(new Date(user.createdAt), "dd MMM yyyy");
    } catch {
      return "Recently joined";
    }
  }, [user?.createdAt]);

  const handleNameSave = async () => {
    if (!name.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setSavingName(true);
    try {
      const res = await saveProfile({ name: name.trim() });
      const updatedUser = res.data.user as ProfileUser;
      setUser(updatedUser);
      setName(updatedUser.name);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("jv_user_name", updatedUser.name || "");
      toast.success("Username updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to update username");
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await savePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Unable to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight">Profile</h1>
        </div>
        <p className="pl-12 text-sm text-muted-foreground">
          Manage the same account details you use to log in.
        </p>
      </div>

      <div className="px-5 space-y-5">
        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserRound className="w-4 h-4 text-primary" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                  <p className="text-lg font-semibold text-foreground">{user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "No email available"}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Role</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      {user?.role || "Admin"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Member Since</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      {memberSince}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Edit Username</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Username</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Login Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  value={user?.email || ""}
                  disabled
                  className="pl-10 opacity-80"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email is shown for reference because it is your current login ID.
              </p>
            </div>

            <Button onClick={handleNameSave} disabled={savingName || loading} className="w-full gradient-gold text-primary-foreground">
              {savingName ? "Saving..." : "Save Username"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <Button onClick={handlePasswordSave} disabled={savingPassword || loading} className="w-full">
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
