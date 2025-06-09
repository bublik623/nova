import { ViewType } from "@/features/experience-curation/components/ViewSelect.vue";

export interface CurationPageProps {
  showRawFields: boolean;
  selectedView: ViewType;
  nextSectionRoute: string;
  isSavingDraft: boolean;
  isReadonly: boolean;
  isSaveEnabled: boolean;
}

export interface CurationPageEvents {
  (e: "hasUnsavedChanges", hasUnsavedChanges: boolean): void;
}
