import { hasPermission } from "@/features/roles/lib/has-permission";
import { ExperienceSource } from "@/types/generated/ContentQueryApiV2";

// Opinoia raw commercial and nova raw settings direct to the same page
const NOVA_RAW_SETTINGS_ROUTE_NAME = "experience-id-raw-settings";
const OPINOIA_RAW_COMMERCIAL_ROUTE_NAME = "experience-id-raw-settings";
const OPINOIA_RAW_DEFAULT_SECTION_ROUTE_NAME = "settings";
const OPINOIA_OPERATIONAL_ROUTE_NAME = "opinoia-id-operational-configuration";

export function getExperienceLinkByPermissions({
  experienceSource,
  experienceId,
}: {
  experienceSource: ExperienceSource;
  experienceId: string;
}) {
  const isOpinoia = experienceSource === "INTERNAL";

  if (isOpinoia) {
    return handleOpinoiaExperience(experienceId);
  }

  return handleNovaExperience(experienceId);
}

function handleOpinoiaExperience(experienceId: string) {
  const canWriteRawCommercial = hasPermission("experience.opinoia.raw-commercial.canWrite");
  const canWriteOperational = hasPermission("experience.opinoia.operational.canWrite");

  if (canWriteOperational && !canWriteRawCommercial) {
    return getLinkObject({
      name: OPINOIA_OPERATIONAL_ROUTE_NAME,
      experienceId,
    });
  }

  return getLinkObject({
    name: OPINOIA_RAW_COMMERCIAL_ROUTE_NAME,
    experienceId,
    section: OPINOIA_RAW_DEFAULT_SECTION_ROUTE_NAME,
  });
}

function handleNovaExperience(experienceId: string) {
  return getLinkObject({
    name: NOVA_RAW_SETTINGS_ROUTE_NAME,
    experienceId,
  });
}

function getLinkObject({ name, experienceId, section }: { name: string; experienceId: string; section?: string }) {
  return {
    name,
    params: {
      id: experienceId,
      section,
    },
  };
}
