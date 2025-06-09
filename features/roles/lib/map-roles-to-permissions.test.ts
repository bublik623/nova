import { describe, it, expect, vi } from "vitest";
import { RolesKey } from "../types/permissions.types";
import { mapRolesToPermissions } from "./map-roles-to-permissions";

vi.mock("../config/roles-mapping", () => ({
  rolePermissionsMapping: {
    admin: ["admin:read", "admin:write"],
    user: ["user:read"],
  },
}));

const logErrorMock = vi.fn();

vi.mock("@/features/core-shared/composables/useLogger", () => ({
  useLogger: () => ({
    logError: logErrorMock,
  }),
}));

describe("mapRolesToPermissions", () => {
  it("should return an empty array if no roles are provided", () => {
    const result = mapRolesToPermissions([]);
    expect(result).toEqual([]);
  });

  it("should return an empty array if no permissions are found for the role", () => {
    const result = mapRolesToPermissions(["no-permissions-role" as RolesKey]);
    expect(result).toEqual([]);
  });

  it("it should log an error if the role is not found in the roles mapping", () => {
    mapRolesToPermissions(["no-permissions-role" as RolesKey]);
    expect(logErrorMock).toHaveBeenCalledWith(
      "roles-no-such-role",
      "Role no-permissions-role not found in the roles mapping"
    );
  });

  it("should return the permissions for the role", () => {
    const result = mapRolesToPermissions(["admin" as RolesKey]);
    expect(result).toEqual(["admin:read", "admin:write"]);
  });

  it("should return the permissions for multiple roles", () => {
    const result = mapRolesToPermissions(["admin" as RolesKey, "user" as RolesKey]);
    expect(result).toEqual(["admin:read", "admin:write", "user:read"]);
  });
});
