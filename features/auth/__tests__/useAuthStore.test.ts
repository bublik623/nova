import { setActivePinia, createPinia, _GettersTree, _ActionsTree } from "pinia";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as TuiUserhub from "@dx/user-login-library";
import { useAuthStore } from "../useAuthStore";
import { exampleTokenResponse } from "../__fixtures__/auth.data";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

vi.mock("@dx/user-login-library", () => {
  return {
    getTokenProperties: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
  };
});

vi.mock("jwt-decode", () => ({
  default: vi.fn(() => ({ sub: "test-user-uuid" })),
}));

describe("useAuthStore.ts store", () => {
  setActivePinia(createPinia());
  const auth = useAuthStore();

  afterEach(() => {
    auth.$reset();
  });

  describe("when there is no token", () => {
    test("`bearerToken` should be undefined", () => {
      expect(auth.bearerToken).toBe(undefined);
    });

    test("`loggedIn` should be false", () => {
      expect(auth.loggedIn).toBe(false);
    });
  });

  describe("when there is a token", () => {
    beforeEach(() => {
      auth.setToken(exampleTokenResponse);
    });

    test("`loggedIn` should be true", () => {
      expect(auth.loggedIn).toBe(true);
    });

    test("`bearerToken` should return the value of id_token", () => {
      expect(auth.bearerToken).toBe("id_token");
    });
  });

  describe("helpers", () => {
    test("login", () => {
      const loginSpy = vi.spyOn(TuiUserhub, "login");
      const pinia = createPinia();
      const auth = useAuthStore(pinia);

      auth.login();
      expect(loginSpy).toBeCalledTimes(1);
    });
    test("logout", () => {
      const pinia = createPinia();
      const auth = useAuthStore(pinia);

      auth.setToken(exampleTokenResponse);
      expect(auth.bearerToken).toBe("id_token");

      auth.logout();
      expect(auth.bearerToken).toBe(undefined);
    });
  });

  describe("userUuid", () => {
    const getPropertiesSpy = vi.spyOn(TuiUserhub, "getTokenProperties");

    test("should return undefined if no bearer token is set", () => {
      const pinia = createPinia();
      const auth = useAuthStore(pinia);
      expect(auth.userUuid).toEqual(undefined);
    });

    test("should return the correct user uuid if a bearer token is set", async () => {
      getPropertiesSpy.mockImplementationOnce(() => {
        return {
          sub: "test-user-uuid",
        };
      });

      const pinia = createPinia();
      const auth = useAuthStore(pinia);

      auth.setToken(exampleTokenResponse);

      expect(auth.userUuid).toEqual("test-user-uuid");
    });
  });

  describe("userRole", () => {
    const getPropertiesSpy = vi.spyOn(TuiUserhub, "getTokenProperties");

    test("should return an empty array if no bearer token is set", () => {
      const pinia = createPinia();
      const auth = useAuthStore(pinia);
      expect(auth.userRoles).toEqual([]);
    });

    test("should return the correct user roles if a bearer token is set", async () => {
      getPropertiesSpy.mockImplementationOnce(() => {
        return {
          roles: "role1,role2,role3",
        };
      });

      const pinia = createPinia();
      const auth = useAuthStore(pinia);

      auth.setToken(exampleTokenResponse);

      expect(auth.userRoles).toEqual(["role1", "role2", "role3"]);
    });
  });

  describe("userName", () => {
    const getPropertiesSpy = vi.spyOn(TuiUserhub, "getTokenProperties");

    test("should return undefined if no bearer token is set", () => {
      const pinia = createPinia();
      const auth = useAuthStore(pinia);
      expect(auth.userName).toEqual(undefined);
    });

    test("should return the correct user name if a bearer token is set", async () => {
      getPropertiesSpy.mockImplementationOnce(() => {
        return {
          name: "test-user-name",
        };
      });

      const pinia = createPinia();
      const auth = useAuthStore(pinia);

      auth.setToken(exampleTokenResponse);

      expect(auth.userName).toEqual("test-user-name");
    });
  });
});
