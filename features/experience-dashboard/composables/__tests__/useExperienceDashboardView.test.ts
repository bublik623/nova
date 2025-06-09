import { describe, it, expect, vi } from "vitest";
import { useExperienceDashboardView } from "../useExperienceDashboardView";
import { DocumentContentType } from "@/types/DocumentStatuses";
import { hasPermission } from "@/features/roles/lib/has-permission";

vi.mock("@/features/roles/lib/has-permission");

const hasPermissionMock = vi.mocked(hasPermission);

describe("useExperienceDashboardView", () => {
  it("should return RAW content when user can read raw but not editorial", () => {
    hasPermissionMock.mockImplementation((permission) => {
      if (permission === "experience.raw.canRead") return true;
      return false;
    });

    const { getInitialContentForView } = useExperienceDashboardView();
    expect(getInitialContentForView.value).toBe(DocumentContentType.RAW);
  });

  it("should return EDITORIAL content when user can read editorial but not raw", () => {
    hasPermissionMock.mockImplementation((permission) => {
      if (
        permission === "experience.curation.canRead" ||
        permission === "experience.media.canRead" ||
        permission === "experience.translation.canRead"
      )
        return true;
      return false;
    });

    const { getInitialContentForView } = useExperienceDashboardView();
    expect(getInitialContentForView.value).toBe(DocumentContentType.EDITORIAL);
  });

  it("should return RAW content when user can read both raw and editorial", () => {
    hasPermissionMock.mockImplementation(() => true);

    const { getInitialContentForView } = useExperienceDashboardView();
    expect(getInitialContentForView.value).toBe(DocumentContentType.RAW);
  });

  it("should correctly compute canUserToggleView", () => {
    hasPermissionMock.mockImplementation((permission) => {
      if (permission === "experience.raw.canRead") return true;
      if (permission === "experience.curation.canRead") return true;
      return false;
    });

    const { canUserToggleView } = useExperienceDashboardView();
    expect(canUserToggleView.value).toBe(true);
  });

  it("should correctly compute shouldHaveRawContent", () => {
    hasPermissionMock.mockImplementation((permission) => {
      if (permission === "experience.raw.canRead") return true;
      return false;
    });

    const { shouldHaveRawContent } = useExperienceDashboardView();
    expect(shouldHaveRawContent.value).toBe(true);
  });

  it("should correctly compute shouldHaveEditorialContent", () => {
    hasPermissionMock.mockImplementation((permission) => {
      if (
        permission === "experience.curation.canRead" ||
        permission === "experience.media.canRead" ||
        permission === "experience.translation.canRead"
      )
        return true;
      return false;
    });

    const { shouldHaveEditorialContent } = useExperienceDashboardView();
    expect(shouldHaveEditorialContent.value).toBe(true);
  });
});
