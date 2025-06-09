import { AxiosError } from "axios";
import { UseAuthStore } from "@/features/auth/useAuthStore";

export interface AuthInterceptorArgs {
  error: AxiosError;
  auth: UseAuthStore;
}

export async function authResponseInterceptor({ auth, error }: AuthInterceptorArgs) {
  if (error.response?.status === 401) {
    auth.logoutOnce();
  }

  return Promise.reject(error);
}
