import { describe, it, expect, vi } from "vitest";
import { getExperienceLinkByPermissions } from "./get-experience-link-by-permissions";
import { hasPermission } from "@/features/roles/lib/has-permission";

vi.mock("@/features/roles/lib/has-permission");

describe("getExperienceLinkByPermissions", () => {
  const experienceId = "test-experience-id";

  it("should return the operational configuration link for Opinoia when the user has operational permission but not raw commercial permission", () => {
    vi.mocked(hasPermission).mockImplementation((permission) => {
      if (permission === "experience.opinoia.operational.canWrite") return true;
      if (permission === "experience.opinoia.raw-commercial.canWrite") return false;
      return false;
    });

    const result = getExperienceLinkByPermissions({
      experienceSource: "INTERNAL",
      experienceId,
    });

    expect(result).toEqual({
      name: "opinoia-id-operational-configuration",
      params: {
        id: experienceId,
        section: undefined,
      },
    });
  });

  it("should return the raw commercial link for Opinoia when the user does not have operational permission", () => {
    vi.mocked(hasPermission).mockImplementation((permission) => {
      if (permission === "experience.opinoia.operational.canWrite") return false;
      if (permission === "experience.opinoia.raw-commercial.canWrite") return true;
      return false;
    });

    const result = getExperienceLinkByPermissions({
      experienceSource: "INTERNAL",
      experienceId,
    });

    expect(result).toEqual({
      name: "experience-id-raw-settings",
      params: {
        id: experienceId,
        section: "settings",
      },
    });
  });

  it("should return the raw commercial link for Opinoia when the user has neither operational nor raw commercial permission", () => {
    vi.mocked(hasPermission).mockReturnValue(false);

    const result = getExperienceLinkByPermissions({
      experienceSource: "INTERNAL",
      experienceId,
    });

    expect(result).toEqual({
      name: "experience-id-raw-settings",
      params: {
        id: experienceId,
        section: "settings",
      },
    });
  });

  it("should return the Nova raw settings link for non-Opinoia experiences", () => {
    const result = getExperienceLinkByPermissions({
      // @ts-expect-error
      experienceSource: "EXTERNAL",
      experienceId,
    });

    expect(result).toEqual({
      name: "experience-id-raw-settings",
      params: {
        id: experienceId,
        section: undefined,
      },
    });
  });
});
