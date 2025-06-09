import { useLogger } from "@/features/core-shared/composables/useLogger";
import { RolesKey, PermissionRecord } from "../types/permissions.types";
import { rolePermissionsMapping } from "../config/roles-mapping";

export function mapRolesToPermissions(roles: RolesKey[]): PermissionRecord[] {
  const logger = useLogger();
  return roles.flatMap((role) => {
    const permissions = rolePermissionsMapping[role];

    if (permissions) {
      return permissions;
    }

    const warningMessage = `Role ${role} not found in the roles mapping`;

    logger.logError("roles-no-such-role", warningMessage);
    // eslint-disable-next-line no-console
    console.warn(warningMessage);

    return [];
  });
}
