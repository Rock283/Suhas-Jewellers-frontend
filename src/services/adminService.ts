import { adminApi } from "./api";

export const adminLogin = (data: { email: string; password: string }) =>
  adminApi.post("/admin/login", data);

export const getAdminSession = () =>
  adminApi.get("/admin/me");

export const getAdminDashboard = () =>
  adminApi.get("/admin/dashboard");

export const getAdminUsers = (search = "") =>
  adminApi.get("/admin/users", { params: { search } });

export const getAdminUserDetails = (id: string) =>
  adminApi.get(`/admin/users/${id}`);

export const createAdminManagedUser = (data: { name: string; email: string; password: string }) =>
  adminApi.post("/admin/users", data);

export const updateAdminUserStatus = (id: string, action: "freeze" | "unfreeze") =>
  adminApi.patch(`/admin/users/${id}/status`, { action });

export const resetAdminUserPassword = (id: string, newPassword: string) =>
  adminApi.patch(`/admin/users/${id}/password`, { newPassword });

export const getAdminSettings = () =>
  adminApi.get("/admin/settings");

export const updateAdminSettings = (data: {
  allowRegistrations?: boolean;
  maintenanceMode?: boolean;
  supportEmail?: string;
  adminEmail?: string;
  currentAdminPassword?: string;
  newAdminPassword?: string;
}) => adminApi.put("/admin/settings", data);
