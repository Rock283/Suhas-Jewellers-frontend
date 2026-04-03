import { api } from "./api";

export const createLoan = (data: any) =>
  api.post("/loans", data);

export const getLoans = () =>
  api.get("/loans");

export const getLoanById = (id: string) =>
  api.get(`/loans/${id}`);

export const updateLoan = (id: string, data: any) =>
  api.put(`/loans/${id}`, data);

export const deleteLoan = (id: string) =>
  api.delete(`/loans/${id}`);

export const addLoanPayment = (id: string, data: any) =>
  api.post(`/loans/${id}/payments`, data);