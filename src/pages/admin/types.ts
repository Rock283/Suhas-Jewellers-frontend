export type DashboardSummary = {
  totalUsers: number;
  activeUsers: number;
  frozenUsers: number;
  totalCustomers: number;
  totalLoans: number;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  accountStatus: "active" | "frozen";
  isFrozen: boolean;
  customerCount: number;
  loanCount: number;
};

export type AdminSettings = {
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  adminEmail: string;
};

export type UserDetailCustomer = {
  _id: string;
  name: string;
  phone: string;
  loans: Array<{
    _id: string;
    itemName: string;
    category: string;
    purity: string;
    loanAmount: number;
    status: string;
  }>;
};
