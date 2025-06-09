import { DocumentSidebarSection } from "../../shared/ExperienceSidebar/types";
import { OpinoiaExperience } from "../../shared/types";
import { useOpinoiaExperience } from "../../shared/useOpinoiaExperience";
import { useOperationalSidebarSections } from "./useOperationalSidebarSections";

export type OperationalSidebarData = {
  experience: Readonly<Ref<OpinoiaExperience>>;
  documentSections: Readonly<Ref<DocumentSidebarSection[]>>;
};

export function useOperationalSidebar(experienceId: Readonly<Ref<string>>): Readonly<OperationalSidebarData> {
  const experience = useOpinoiaExperience(experienceId);
  const documentSections = useOperationalSidebarSections(experienceId);

  return {
    experience,
    documentSections,
  };
}
