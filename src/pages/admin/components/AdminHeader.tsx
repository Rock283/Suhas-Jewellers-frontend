import { ArrowLeft, RefreshCw, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

const AdminHeader = ({ refreshing, onRefresh, onLogout }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-10 pb-5">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Admin Control Center</h1>
          <p className="text-[11px] text-muted-foreground">Monitor users, customers, account status and platform controls</p>
        </div>
        <Shield className="w-5 h-5 text-destructive ml-auto" />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/settings")}>
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button variant="destructive" onClick={onLogout}>Admin Logout</Button>
      </div>
    </div>
  );
};

export default AdminHeader;
