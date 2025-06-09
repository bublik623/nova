import { PermissionRecord, Permission } from "../types/permissions.types";

export function mergeRolesPermissions(rolePermissions: PermissionRecord[]): PermissionRecord {
  return rolePermissions.reduce((acc, val) => {
    const keys = Object.keys(val) as Permission[];

    for (const key of keys) {
      acc[key] = acc[key] || val[key];
    }

    return acc;
  }, {} as PermissionRecord);
}
