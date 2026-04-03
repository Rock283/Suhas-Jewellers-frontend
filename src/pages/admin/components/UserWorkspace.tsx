import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/interest";
import type { AdminUser, UserDetailCustomer } from "../types";

type UserWorkspaceProps = {
  selectedUser: AdminUser | null;
  selectedCustomers: UserDetailCustomer[];
  passwordReset: string;
  totalPortfolio: number;
  onPasswordResetChange: (value: string) => void;
  onResetPassword: () => void;
};

const UserWorkspace = ({
  selectedUser,
  selectedCustomers,
  passwordReset,
  totalPortfolio,
  onPasswordResetChange,
  onResetPassword,
}: UserWorkspaceProps) => {
  return (
    <Card className="glass-card border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Selected User Workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedUser ? (
          <>
            <div className="rounded-xl border border-border p-4 bg-card/50">
              <p className="text-base font-semibold text-foreground">{selectedUser.name}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Customers</p>
                  <p className="font-semibold">{selectedUser.customerCount}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Loans</p>
                  <p className="font-semibold">{selectedUser.loanCount}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Portfolio Value</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(totalPortfolio)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reset User Password</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="New password"
                  value={passwordReset}
                  onChange={(e) => onPasswordResetChange(e.target.value)}
                />
                <Button onClick={onResetPassword}>
                  <KeyRound className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {selectedCustomers.map((customer) => (
                <div key={customer._id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{customer.name}</p>
                  <p className="text-[11px] text-muted-foreground">{customer.phone}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{customer.loans.length} loans</p>
                  <div className="mt-2 space-y-2">
                    {customer.loans.map((loan) => (
                      <div key={loan._id} className="rounded-lg bg-muted/50 p-2">
                        <p className="text-xs font-medium text-foreground">{loan.itemName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {loan.category} - {loan.purity} - {formatCurrency(loan.loanAmount)} - {loan.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {selectedCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground">This user has no customers yet.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select a user to inspect their customers, loans and account controls.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserWorkspace;
