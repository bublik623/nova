import { describe, it, expect, vi } from "vitest";
import { hasPermission } from "./has-permission";
import { Permission } from "../types/permissions.types";

const usePermissionsStoreMock = {
  currentPermissions: {
    "truthy-permission": true,
    "falsy-permission": false,
  },
};

vi.mock("@/features/roles/stores/usePermissionsStore", () => ({
  usePermissionsStore: () => usePermissionsStoreMock,
}));

describe("hasPermission", () => {
  it("should return true when the authenticated user has the given permission", () => {
    const result = hasPermission("truthy-permission" as Permission);
    expect(result).toBe(true);
  });

  it("should return false when the authenticated user does not have the given permission", () => {
    const result = hasPermission("falsy-permission" as Permission);
    expect(result).toBe(false);
  });
});
