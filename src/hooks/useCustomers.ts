import { getCustomers } from "@/services/customerService";

export const useCustomers = () => {
  const fetchCustomers = async () => {
    const res = await getCustomers();
    return res.data;
  };

  return { fetchCustomers };
};