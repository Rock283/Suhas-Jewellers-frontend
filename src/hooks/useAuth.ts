import { loginUser } from "@/services/authService";

export const useAuth = () => {
  const login = async (data: any) => {
    const res = await loginUser(data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  };

  return { login };
};