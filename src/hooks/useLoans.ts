import { getLoans } from "@/services/loanService";

export const useLoans = () => {
  const fetchLoans = async () => {
    const res = await getLoans();
    return res.data;
  };

  return { fetchLoans };
};