import { MappedCategory } from "@/types/DocumentSidebar";
import { RevisionOptions, ExperienceRevision } from "../types/revision";
import { AllowedRevisionFlow } from "../schema";
import { getCurationSections } from "../config/curation.config";
import { getTranslationSections } from "../config/translation.config";
import { getRawSections } from "../config/raw.config";
import { getMediaSections } from "../config/media.config";

export function getSidebarConfig(
  language: string,
  flow: AllowedRevisionFlow,
  experienceId: string,
  revisionId: string,
  values: ExperienceRevision,
  options: RevisionOptions
): {
  items: Record<string, MappedCategory>;
  requiredFields: string[];
} {
  const baseUrl = `/experience/${experienceId}/revision/${revisionId}/${flow}`;

  switch (flow) {
    case "raw": {
      const rawSections = getRawSections(baseUrl, values, options);
      return {
        items: rawSections,
        requiredFields: getRequiredFields(rawSections).map((field) => field.id),
      };
    }
    case "curation": {
      const curationSections = getCurationSections(baseUrl, values, options);
      return {
        items: curationSections,
        requiredFields: getRequiredFields(curationSections).map((field) => field.id),
      };
    }

    case "translation": {
      const sections = getTranslationSections(baseUrl, language, values);
      return {
        items: sections,
        requiredFields: getRequiredFields(sections).map((field) => field.id),
      };
    }

    case "media": {
      const sections = getMediaSections(baseUrl, values);
      return {
        items: sections,
        requiredFields: getRequiredFields(sections).map((field) => field.id),
      };
    }

    default:
      throw new Error(`Could not get sidebar config for flow "${flow}"`);
  }
}

function getRequiredFields(sections: Record<string, MappedCategory>) {
  return Object.values(sections).flatMap((section) => section.fields.filter((field) => field.required));
}
