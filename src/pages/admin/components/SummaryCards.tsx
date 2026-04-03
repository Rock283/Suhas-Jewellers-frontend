import { AlertTriangle, Building2, Lock, Shield, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "../types";

type SummaryCardsProps = {
  summary: DashboardSummary | null;
};

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const cards = [
    { label: "Total Users", value: summary?.totalUsers || 0, icon: Users },
    { label: "Active Users", value: summary?.activeUsers || 0, icon: Shield },
    { label: "Frozen Users", value: summary?.frozenUsers || 0, icon: Lock },
    { label: "Customers", value: summary?.totalCustomers || 0, icon: Building2 },
    { label: "Loans", value: summary?.totalLoans || 0, icon: AlertTriangle },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((item) => (
        <Card key={item.label} className="glass-card border-border/60">
          <CardContent className="p-4">
            <item.icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;
