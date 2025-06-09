import { defineStore, acceptHMRUpdate } from "pinia";
import { PermissionRecord, RolesKey } from "../types/permissions.types";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { mapRolesToPermissions } from "../lib/map-roles-to-permissions";
import { mergeRolesPermissions } from "../lib/merge-roles-permissions";

export const usePermissionsStore = defineStore("usePermissionsStore", () => {
  const auth = useAuthStore();
  // This should be the only casting needed, unless we want to validate at run-time with Zod
  const currentRoles = computed<RolesKey[]>(() => auth.userRoles as RolesKey[]);

  const currentPermissions = computed<PermissionRecord>(() => {
    const rolesToPermissions: PermissionRecord[] = mapRolesToPermissions(currentRoles.value);
    const mergedPermissions = mergeRolesPermissions(rolesToPermissions);

    return mergedPermissions;
  });

  return {
    currentRoles,
    currentPermissions,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePermissionsStore, import.meta.hot));
}
