import { describe, it, expect, vi } from "vitest";
import { usePermissionsStore } from "@/features/roles/stores/usePermissionsStore";
import {
  VIEW_TYPE_ALL,
  VIEW_TYPE_COMMERCIAL,
  viewIsTypeAll,
  viewIsTypeCommercial,
  userShouldDefaultToCommercialView,
  areNonCommercialFieldsEditableForUser,
} from "../viewTypeUtils";

vi.mock("@/features/roles/stores/usePermissionsStore");
const userPermissionStoreMock = vi.mocked(usePermissionsStore);

describe("viewIsTypeAll", () => {
  it("should return true if view is 'all'", () => {
    expect(viewIsTypeAll(VIEW_TYPE_ALL)).toBe(true);
  });

  it("should return false if view is not 'all'", () => {
    expect(viewIsTypeAll("commercial")).toBe(false);
  });
});

describe("viewIsTypeCommercial", () => {
  it("should return true if view is 'commercial'", () => {
    expect(viewIsTypeCommercial(VIEW_TYPE_COMMERCIAL)).toBe(true);
  });

  it("should return false if view is not 'commercial'", () => {
    expect(viewIsTypeCommercial("all")).toBe(false);
  });
});

describe("userShouldDefaultToCommercialView", () => {
  it("should return true if user has only 'nova_copywriter' role", () => {
    // @ts-expect-error ...
    userPermissionStoreMock.mockReturnValue({
      currentRoles: ["nova_copywriter"],
    });
    expect(userShouldDefaultToCommercialView()).toBe(true);
  });

  it("should return false if user does not have only 'nova_copywriter' role", () => {
    userPermissionStoreMock.mockReturnValue({
      // @ts-expect-error ...
      currentRoles: ["some_other_role"],
    });
    expect(userShouldDefaultToCommercialView()).toBe(false);
  });
});

describe("areNonCommercialFieldsEditableForUser", () => {
  it("should return false if user has only 'nova_copywriter' role", () => {
    // @ts-expect-error ...
    userPermissionStoreMock.mockReturnValue({
      currentRoles: ["nova_copywriter"],
    });
    expect(areNonCommercialFieldsEditableForUser()).toBe(false);
  });

  it("should return true if user does not have only 'nova_copywriter' role", () => {
    // @ts-expect-error ...
    usePermissionsStore.mockReturnValue({
      currentRoles: ["some_other_role"],
    });
    expect(areNonCommercialFieldsEditableForUser()).toBe(true);
  });
});
