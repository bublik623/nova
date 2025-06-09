export type Permission =
  | "experience.raw.canRead"
  | "experience.raw.canWrite"
  | "experience.raw.canSendToReview"
  | "experience.media.canRead"
  | "experience.media.canWrite"
  | "experience.curation.canRead"
  | "experience.curation.canWrite"
  | "experience.translation.canRead"
  | "experience.translation.canWrite"
  | "experience.options.canWrite"
  | "experience.opinoia.raw-commercial.canWrite"
  | "experience.opinoia.operational.canWrite"
  | "masterdata-management.canWrite"
  | "masterdata-management.translations.canWrite"
  | "stop-sales.canWrite";

export type PermissionRecord = Record<Permission, boolean>;

export const ROLE_KEYS = [
  "nova_admin",
  "nova_supply_manager",
  "nova_setup_exec",
  "nova_copywriter",
  "nova_translator",
  "nova_media_manager",
  "nova_readonly",
] as const;

export type RolesKey = (typeof ROLE_KEYS)[number];

export type RolesRecord = Record<RolesKey, PermissionRecord>;
