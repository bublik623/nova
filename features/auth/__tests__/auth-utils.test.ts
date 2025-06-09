import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertStringToArray, useAuthCleanRoute } from "../auth-utils";
import { config } from "@vue/test-utils";
import { mockLoadComposableInApp } from "@/features/testing/utils/mock-load-composable-in-app";

const mockRoute = {
  path: "/experience/12345/raw/settings",
  fullPath: "/experience/12345/raw/settings",
  query: {
    code: "auth code",
  },
};
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

config.global.mocks = {
  $t: (text: string) => text,
  $route: mockRoute,
  $router: mockRouter,
};

vi.stubGlobal("useRoute", () => mockRoute);
vi.stubGlobal("useRouter", () => mockRouter);

describe("auth-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useAuthCleanRoute", () => {
    it("should clear code query parameter from the URL", async () => {
      const { result } = mockLoadComposableInApp(() => useAuthCleanRoute());
      console.log(result);

      await nextTick();

      expect(mockRouter.replace).toBeCalledTimes(1);
      expect(mockRouter.replace).toBeCalledWith({ query: { code: undefined } });
    });
  });

  describe("convertStringToArray", () => {
    it("should parse comma-separated string enclosed in brackets", () => {
      const input = "[read, write, delete]";
      const result = convertStringToArray(input);
      const expectedResult = ["read", "write", "delete"];

      expect(result).toEqual(expectedResult);
    });

    it("should handle empty input", () => {
      const input = "";
      const result = convertStringToArray(input);

      expect(result).toEqual([]);
    });

    it("should handle undefined input", () => {
      const result = convertStringToArray(undefined);

      expect(result).toEqual([]);
    });
  });
});
