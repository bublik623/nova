import { mapSidebarSections } from "@/features/experience-shared/utils/map-sidebar-sections";
import { SidebarSections, SidebarCategory } from "@/types/DocumentSidebar";
import { ExperienceRevision, RevisionOptions } from "../types/revision";
import { RevisionFormProps } from "../types/forms";
import RevisionVisualsForm from "../components/RevisionVisualsForm.vue";

export function getMediaForms(
  values: ExperienceRevision | null,
  options: RevisionOptions,
  requiredFields: string[]
): {
  visuals: {
    is: typeof RevisionVisualsForm;
    props: RevisionFormProps;
  };
} {
  const mediaFormProps: RevisionFormProps = {
    values,
    options,
    requiredFields,
    flow: "media",
  } as const;

  return {
    visuals: {
      is: RevisionVisualsForm,
      props: mediaFormProps,
    },
  };
}

export function getMediaSections(baseUrl: string, values: ExperienceRevision) {
  const sections: SidebarSections = {
    visuals: getVisualsSection(baseUrl, values),
  };

  return mapSidebarSections(sections);
}

function getVisualsSection(baseUrl: string, values?: ExperienceRevision): SidebarCategory {
  return {
    url: `${baseUrl}/visuals`,
    icon: "gallery",
    fields: [
      {
        id: "gallery",
        required: true,
        filled: (values?.images?.length || 0) > 0,
      },
    ],
  };
}
