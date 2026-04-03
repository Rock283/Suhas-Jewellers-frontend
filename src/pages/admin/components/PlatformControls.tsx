import { Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSettings } from "../types";

type PlatformControlsProps = {
  settings: AdminSettings;
  adminNote: string;
  onAdminNoteChange: (value: string) => void;
};

const PlatformControls = ({
  settings,
  adminNote,
  onAdminNoteChange,
}: PlatformControlsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <Card className="glass-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Platform Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border p-4 bg-card/50 space-y-2">
            <p className="text-sm font-medium text-foreground">Current Platform Status</p>
            <p className="text-[11px] text-muted-foreground">
              Registrations: {settings.allowRegistrations ? "Enabled" : "Disabled"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Maintenance Mode: {settings.maintenanceMode ? "Enabled" : "Disabled"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Support Email: {settings.supportEmail}
            </p>
          </div>
          <Button onClick={() => navigate("/admin/settings")} variant="outline">
            Open Admin Settings
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Admin Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={adminNote} onChange={(e) => onAdminNoteChange(e.target.value)} className="min-h-[140px]" />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformControls;
