import { InternalAxiosRequestConfig } from "axios";
import { UseAuthStore } from "@/features/auth/useAuthStore";

export async function authRequestInterceptor(config: InternalAxiosRequestConfig, auth: UseAuthStore) {
  const tokenResponse = await auth.verifyToken();
  auth.setToken(tokenResponse);

  if (config.headers) {
    config.headers.Authorization = `Bearer ${auth.bearerToken}`;
  }
  return config;
}
