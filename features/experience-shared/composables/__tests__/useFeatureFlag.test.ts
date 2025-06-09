import { featureFlagConfig, RemoteFlagNames, useFeatureFlag } from "../useFeatureFlag";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from "vitest";
import { isFeatureBranchUrl } from "@/features/sso-proxy/sso-proxy-utils";

// Mock the useRoute global function
vi.stubGlobal("useRoute", () => ({ query: {} }));

// Mock the isFeatureBranchUrl function
vi.mock("@/features/sso-proxy/sso-proxy-utils", () => ({
  isFeatureBranchUrl: vi.fn(() => false),
}));

import * as useConfigcatComposable from "@/features/core-shared/composables/useConfigCat";
import { IConfigCatClient } from "configcat-js";

const mockSnapshot = vi.fn();

const mockConfigCatClient = {
  snapshot: mockSnapshot,
} as unknown as IConfigCatClient;

const mockedIsFeatureBranchUrl = vi.mocked(isFeatureBranchUrl);

describe("useFeatureFlag", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(useConfigcatComposable, "useConfigcat").mockReturnValue({
      configCatClient: mockConfigCatClient,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("remote flags", () => {
    describe("application environments (test,pre,prod, integration)", () => {
      describe("preview environments (feature branches)", () => {
        beforeAll(() => {
          mockedIsFeatureBranchUrl.mockReturnValue(true);
          vi.stubEnv("MODE", "app");
        });
        afterAll(() => {
          vi.unstubAllEnvs();
        });
        // since we dont have an environment for feature branches on configcat
        test("should return true for all flags even if they are false on remote config", () => {
          mockSnapshot.mockImplementation(() => ({ fetchedConfig: { settings: { falseFlag: { value: false } } } }));

          const flagValue = useFeatureFlag("falseFlag" as RemoteFlagNames);
          expect(flagValue).toBe(true);
        });

        test("should ignore maintenance mode flag on preview environments", () => {
          mockSnapshot.mockImplementation(() => ({ fetchedConfig: { settings: { MAINTENANCE: { value: true } } } }));

          const flagValue = useFeatureFlag("MAINTENANCE" as RemoteFlagNames);
          expect(flagValue).toBe(false);
        });
      });
      describe("application environments (test,pre,prod,integration)", () => {
        beforeAll(() => {
          mockedIsFeatureBranchUrl.mockReturnValue(false);
          vi.stubEnv("MODE", "app");
        });
        afterAll(() => {
          vi.unstubAllEnvs();
        });

        test("should return the correct value for a boolean flag", () => {
          mockSnapshot.mockImplementation(() => ({ fetchedConfig: { settings: { testFlag: { value: true } } } }));

          const flagValue = useFeatureFlag("testFlag" as RemoteFlagNames);
          expect(flagValue).toBe(true);
        });

        test("should throw an error if the flag is not a boolean", () => {
          mockSnapshot.mockImplementation(() => ({
            fetchedConfig: { settings: { stringFlag: { value: "new-string" } } },
          }));

          expect(() => useFeatureFlag("stringFlag" as RemoteFlagNames)).toThrow(
            `the type of the flag 'stringFlag' is not supported, we support only booleans`
          );
        });
      });
      describe("test environments (vitest and playwright)", () => {
        beforeAll(() => {
          vi.stubEnv("MODE", "test");
        });
        afterAll(() => {
          vi.unstubAllEnvs();
        });

        test("should return true for all flags except maintenance", () => {
          mockSnapshot.mockImplementation(() => ({ fetchedConfig: { settings: { testFlag: { value: false } } } }));

          const flagValue = useFeatureFlag("testFlag" as RemoteFlagNames);
          expect(flagValue).toBe(true);

          const maintenanceFlagValue = useFeatureFlag("MAINTENANCE" as RemoteFlagNames);
          expect(maintenanceFlagValue).toBe(false);
        });
      });
    });
  });

  describe("local flags", () => {
    // original window.location
    let originalLocation: Location;

    beforeAll(() => {
      vi.stubEnv("MODE", "app");

      // Save the original location object
      originalLocation = window.location;

      // Mock window.location.hostname
      Object.defineProperty(window, "location", {
        value: { hostname: "https://nova.pre.tui-mm.com/some-url" },
        writable: true,
      });
    });

    afterAll(() => {
      window.location = originalLocation;
      vi.unstubAllEnvs();
    });

    it("should return false when the feature flag is disabled for localhost", () => {
      const flagName = "disabled-feature";
      (featureFlagConfig as any)[flagName] = { localhost: false, test: false, pre: false, prod: false };

      expect(useFeatureFlag(flagName as any)).toBe(false);
    });

    it("should return true when the feature flag is enabled for some environments", () => {
      const flagName = "feature-enabled-on-pre";
      (featureFlagConfig as any)[flagName] = {
        localhost: false,
        test: false,
        // enabled for pre
        pre: true,
        prod: false,
      };

      expect(useFeatureFlag(flagName as any)).toBe(true);
    });

    test("it should return the default value if the feature flag was not found", () => {
      const flagValueTrue = useFeatureFlag("not-existing-flag" as any, true);
      expect(flagValueTrue).toBe(true);
    });

    test("it should trigger a console.error the default value if the feature flag was not found", () => {
      const flagValueFalse = useFeatureFlag("not-existing-flag" as any);
      expect(flagValueFalse).toBe(false);

      // eslint-disable-next-line no-console
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "unable to find the value of the feature flag 'not-existing-flag', returning the default value"
      );
    });

    describe("test environment", () => {
      beforeAll(() => {
        vi.stubEnv("MODE", "test"); // Override environment variable
      });
      afterAll(() => {
        vi.unstubAllEnvs();
      });

      test("should return true by default if we are running in test", () => {
        const flagName = "not-existing-flag";
        expect(useFeatureFlag(flagName as any)).toBe(true);
      });
    });
  });
});
