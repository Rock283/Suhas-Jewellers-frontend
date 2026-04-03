import { api } from "./api";

export const createCustomer = (data: any) =>
  api.post("/customers", data);

export const getCustomers = () =>
  api.get("/customers");

export const getCustomerById = (id: string) =>
  api.get(`/customers/${id}`);

export const updateCustomer = (id: string, data: any) =>
  api.put(`/customers/${id}`, data);

export const deleteCustomer = (id: string) =>
  api.delete(`/customers/${id}`);