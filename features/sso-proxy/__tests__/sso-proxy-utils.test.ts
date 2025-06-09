import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isFeatureBranchUrl,
  isGitlabPagesUrl,
  getSSOProxyUrl,
  getBaseUrlFromFeatureBranchUrl,
} from "../sso-proxy-utils";

// Mock the decodeUrl function
vi.mock("@dx/user-login-library", () => ({
  decodeUrl: vi.fn(),
}));

// Mock useRuntimeConfig
const mockUseRuntimeConfig = vi.fn();
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

function mockWindowLocation(href: string) {
  vi.spyOn(window, "location", "get").mockReturnValue({
    href,
  } as unknown as Location);
}

describe("sso-proxy-utils", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("isFeatureBranchUrl", () => {
    it("should return true when URL matches FEATURE_BRANCH_URL_REGEX", () => {
      mockWindowLocation("https://dx.pages.devops.tui/some/path");

      expect(isFeatureBranchUrl()).toBe(true);
    });

    it("should return false when URL does not match FEATURE_BRANCH_URL_REGEX", () => {
      mockWindowLocation("https://example.com/some/path");

      expect(isFeatureBranchUrl()).toBe(false);
    });
  });

  describe("isGitlabPagesUrl", () => {
    it("should return true when URL matches GITLAB_PAGES_URL_REGEX", () => {
      mockWindowLocation("https://nova-dx-offer-content-somerandomnumbers.pages.devops.tui");

      expect(isGitlabPagesUrl()).toBe(true);
    });

    it("should return false when URL does not match GITLAB_PAGES_URL_REGEX", () => {
      mockWindowLocation("https://example.com/index.html");

      expect(isGitlabPagesUrl()).toBe(false);
    });
  });

  describe("getSSOProxyUrl", () => {
    it("should return GITLAB_PAGES_URL when on a feature branch URL", () => {
      mockWindowLocation("https://dx.pages.devops.tui/some/path");

      expect(getSSOProxyUrl()).toBe(
        "https://nova-dx-offer-content-39d504029f02f2225b9dbcdf673217df17797b8ef.pages.devops.tui"
      );
    });

    it("should return undefined when not on a feature branch URL", () => {
      mockWindowLocation("https://example.com/some/path");

      expect(getSSOProxyUrl()).toBeUndefined();
    });
  });

  describe("getBaseUrlFromFeatureBranchUrl", () => {
    it("should return the base URL from a full URL containing a hash `#/`", () => {
      const url = "https://example.com/index.html#/settings/something/else";
      const result = getBaseUrlFromFeatureBranchUrl(url);
      expect(result).toBe("https://example.com/index.html");
    });

    it("should extract the base URL correctly from a URL without additional paths after index.html", () => {
      const url = "https://example.com/index.html/dashboard";
      const result = getBaseUrlFromFeatureBranchUrl(url);
      expect(result).toBe("https://example.com/index.html");
    });

    it("should return the original URL if 'index.html' is not present", () => {
      const url = "https://example.com/dashboard";
      const result = getBaseUrlFromFeatureBranchUrl(url);
      expect(result).toBe("https://example.com/dashboard");
    });
  });
});
