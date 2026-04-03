import { api } from "./api";

export const loginUser = (data: any) =>
  api.post("/auth/login", data);

export const registerUser = (data: any) =>
  api.post("/auth/register", data);

export const getProfile = () =>
  api.get("/auth/me");

export const updateProfile = (data: { name: string }) =>
  api.put("/auth/me", data);

export const updatePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put("/auth/me/password", data);
