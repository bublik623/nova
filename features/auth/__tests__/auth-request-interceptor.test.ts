import { AxiosRequestConfig } from "axios";
import { MockedObject, describe, expect, test, vi } from "vitest";
import { authRequestInterceptor } from "../auth-request-interceptor";
import { UseAuthStore } from "../useAuthStore";

describe("authRequestInterceptor", () => {
  const auth = {
    bearerToken: "mockToken",
    verifyToken: vi.fn(),
    setToken: vi.fn(),
  } as MockedObject<UseAuthStore>;

  test("should add Authorization header to request config", async () => {
    const config: AxiosRequestConfig = {
      headers: {},
    };
    const expectedConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${auth.bearerToken}`,
      },
    };

    const result = await authRequestInterceptor(config, auth);
    expect(result).toEqual(expectedConfig);
  });

  test("should not modify request config if headers property does not exist", async () => {
    const config: AxiosRequestConfig = {};
    const result = await authRequestInterceptor(config, auth);

    expect(result).toEqual(config);
  });

  test("verifies and updates the token", async () => {
    const verifyTokenSpy = vi.spyOn(auth, "verifyToken");
    const setTokenSpy = vi.spyOn(auth, "setToken");
    const config: AxiosRequestConfig = {};

    await authRequestInterceptor(config, auth);

    expect(verifyTokenSpy).toHaveBeenCalledOnce();
    expect(setTokenSpy).toHaveBeenCalledOnce();
  });
});
