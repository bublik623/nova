/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, MockedObject, test, vi } from "vitest";
import { AxiosResponse } from "axios";
import { createHttpInstance } from "../http";
import { ndjsonInterceptor } from "../ndjson-interceptor";
import * as authRequestInterceptorModule from "@/features/auth/auth-request-interceptor";
import { UseAuthStore } from "@/features/auth/useAuthStore";

describe("createHttpInstance", () => {
  const auth = {
    logoutOnce: vi.fn(),
    bearerToken: "bearer-token",
    verifyToken: vi.fn(),
    setToken: vi.fn(),
  } as MockedObject<UseAuthStore>;

  const http = createHttpInstance({ auth });
  const responseInterceptors: Array<Record<string, any>> = (http.interceptors.response as any).handlers;

  const mockResponse: Partial<AxiosResponse> = {
    status: 200,
    data: `{ "parsed": true }`,
    headers: {
      "content-type": "application/x-ndjson",
    },
  };

  const requestInterceptors: Array<Record<string, any>> = (http.interceptors.request as any).handlers;

  test("should add ndjson-interceptor to the instance", () => {
    expect(responseInterceptors.some((interceptor: any) => interceptor.fulfilled === ndjsonInterceptor)).toBe(true);
  });

  test("should add auth-request-interceptor to the instance", () => {
    const authRequestInterceptorSpy = vi.spyOn(authRequestInterceptorModule, "authRequestInterceptor");

    // mock call
    requestInterceptors[0].fulfilled(mockResponse);

    expect(authRequestInterceptorSpy).toHaveBeenCalledOnce();
  });
});
