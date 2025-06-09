import { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";

export function useSidebarAllotmentSection(experienceId: Readonly<Ref<string>>): Readonly<Ref<DocumentSidebarSection>> {
  return computed(() => ({
    key: "allotment",
    url: `/opinoia/${experienceId.value}/operational/allotment`,
    isRequired: true,
    isValid: false,
    icon: "allotment",
    fields: [
      {
        key: "allotment",
        isRequired: false,
        isValid: false,
        isHidden: false,
      },
    ],
    showFields: false,
  }));
}
