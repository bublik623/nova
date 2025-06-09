import { beforeAll, beforeEach, describe, expect, Mock, test, vi } from "vitest";
import { getExperienceFlowFromRoute } from "@/features/experience-shared/utils/get-experience-flow-from-route";
import { hasPermission } from "@/features/roles/lib/has-permission";
import { AppErrorCause } from "@/types/AppErrorsCause";
import restrictFlowMiddleware from "../restrict-flow";

const to = { path: "/next-page" };
const from = { path: "/previous-page" };

vi.mock("nuxt/app", () => ({
  defineNuxtRouteMiddleware: vi.fn((fun) => fun),
}));

vi.mock("@/features/experience-shared/utils/get-experience-flow-from-route", () => ({
  getExperienceFlowFromRoute: vi.fn(),
}));

vi.mock("@/features/roles/lib/has-permission", () => ({
  hasPermission: vi.fn(),
}));

describe("restrict flow middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  beforeAll(() => {
    globalThis.showError = vi.fn(({ cause }) => new Error(cause));
  });

  test("it should return undefined if is not a restricted flow", async () => {
    (getExperienceFlowFromRoute as Mock).mockReturnValue(null);

    const result = await restrictFlowMiddleware(to, from);

    expect(getExperienceFlowFromRoute).toHaveBeenCalledWith(to);
    expect(result).toBeUndefined();
  });

  test("should allow access if user has permission", async () => {
    (getExperienceFlowFromRoute as Mock).mockReturnValue("raw");
    (hasPermission as Mock).mockReturnValue(true);

    const result = await restrictFlowMiddleware(to, from);

    expect(getExperienceFlowFromRoute).toHaveBeenCalledWith(to);
    expect(hasPermission).toHaveBeenCalledWith("experience.raw.canRead");
    expect(result).toBeUndefined();
  });

  test("should throw an error if user has no permission", async () => {
    (getExperienceFlowFromRoute as Mock).mockReturnValue("raw");
    (hasPermission as Mock).mockReturnValue(false);

    expect(() => restrictFlowMiddleware(to, from)).toThrowError(new Error(AppErrorCause.MISSING_PERMISSION));
  });
});
