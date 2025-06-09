import { usePermissionsStore } from "@/features/roles/stores/usePermissionsStore";
import { Permission } from "../types/permissions.types";

/**
 * Checks if the given permission is present in the permissions store.
 * This is an util for easier access and testing.
 */
export function hasPermission(permission: Permission): boolean {
  const store = usePermissionsStore();
  return store.currentPermissions[permission];
}
