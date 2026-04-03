import { Eye, Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminUser } from "../types";

type CreateForm = {
  name: string;
  email: string;
  password: string;
};

type UserAccountsSectionProps = {
  users: AdminUser[];
  search: string;
  createForm: CreateForm;
  onSearch: (value: string) => void;
  onSelectUser: (userId: string) => void;
  onToggleFreeze: (user: AdminUser) => void;
  onCreateFormChange: (nextValue: CreateForm) => void;
  onCreateUser: () => void;
};

const UserAccountsSection = ({
  users,
  search,
  createForm,
  onSearch,
  onSelectUser,
  onToggleFreeze,
  onCreateFormChange,
  onCreateUser,
}: UserAccountsSectionProps) => {
  return (
    <div className="space-y-5">
      <Card className="glass-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <div key={user._id} className="rounded-xl border border-border p-4 bg-card/50">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {user.customerCount} customers - {user.loanCount} loans - {user.isFrozen ? "Frozen" : "Active"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSelectUser(user._id)}>
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant={user.isFrozen ? "default" : "destructive"}
                      size="sm"
                      onClick={() => onToggleFreeze(user)}
                    >
                      {user.isFrozen ? "Unfreeze" : "Freeze"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-sm text-muted-foreground">No users matched your search.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Create User Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Full name"
              value={createForm.name}
              onChange={(e) => onCreateFormChange({ ...createForm, name: e.target.value })}
            />
            <Input
              placeholder="Email address"
              type="email"
              value={createForm.email}
              onChange={(e) => onCreateFormChange({ ...createForm, email: e.target.value })}
            />
            <Input
              placeholder="Temporary password"
              type="password"
              value={createForm.password}
              onChange={(e) => onCreateFormChange({ ...createForm, password: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Professional addition: admin can provision accounts directly and hand credentials to staff or branch owners.
          </p>
          <Button onClick={onCreateUser} className="gradient-gold text-primary-foreground">
            Create User
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccountsSection;
