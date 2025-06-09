import { hasPermission } from "@/features/roles/lib/has-permission";
import { Permission } from "@/features/roles/types/permissions.types";
import { AppErrorCause } from "@/types/AppErrorsCause";
import { DocumentContentType } from "@/types/DocumentStatuses";
import { defineNuxtRouteMiddleware } from "#app";
import { getExperienceFlowFromRoute } from "@/features/experience-shared/utils/get-experience-flow-from-route";

export default defineNuxtRouteMiddleware((to) => {
  const restrictedFlow = getExperienceFlowFromRoute(to);
  if (!restrictedFlow) {
    return;
  }
  if (hasPermission(MapFlowToPermission[restrictedFlow])) {
    return;
  } else {
    throw showError({ cause: AppErrorCause.MISSING_PERMISSION });
  }
});

const MapFlowToPermission: Record<DocumentContentType, Permission> = {
  raw: "experience.raw.canRead",
  editorial: "experience.curation.canRead",
  translation: "experience.translation.canRead",
  media: "experience.media.canRead",
};
