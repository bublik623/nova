import { describe, expect, MockedObject, test, vi } from "vitest";
import { AuthInterceptorArgs, authResponseInterceptor } from "../auth-response-interceptor";
import { UseAuthStore } from "../useAuthStore";

vi.mock("@/features/auth/useAuthStore");

describe("authResponseInterceptor", () => {
  const auth = {
    logoutOnce: vi.fn(),
  } as unknown as MockedObject<UseAuthStore>;

  test("should logout if its 401 error", async () => {
    const error = {
      config: {},
      response: { status: 401 },
    } as unknown as AuthInterceptorArgs["error"];

    await expect(authResponseInterceptor({ error, auth })).rejects.toBe(error);

    expect(auth.logoutOnce).toHaveBeenCalledOnce();
  });

  test("should reject the error if it is not 401", async () => {
    const error = {
      config: {},
      response: { status: 500 },
    } as unknown as AuthInterceptorArgs["error"];

    await expect(authResponseInterceptor({ error, auth })).rejects.toBe(error);
  });
});
