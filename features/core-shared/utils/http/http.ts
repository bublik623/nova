import axios, { AxiosRequestConfig } from "axios";
import { authRequestInterceptor } from "../../../auth/auth-request-interceptor";
import { ndjsonInterceptor } from "./ndjson-interceptor";
import { UseAuthStore } from "@/features/auth/useAuthStore";
import { authResponseInterceptor } from "@/features/auth/auth-response-interceptor";

export const createHttpInstance = ({ config, auth }: { config?: AxiosRequestConfig; auth: UseAuthStore }) => {
  const axiosConfig: AxiosRequestConfig = config || {};
  const http = axios.create(axiosConfig);

  // Add ndjson interceptor
  http.interceptors.response.use(ndjsonInterceptor);

  // Add authorization header
  http.interceptors.request.use((request) => authRequestInterceptor(request, auth));

  // Add auth refresh token interceptor
  http.interceptors.response.use(
    (response) => response,
    (error) => authResponseInterceptor({ error, auth })
  );

  return http;
};
