import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";

export type DocumentSidebarSection = {
  key: string;
  url: string;
  isRequired: boolean;
  isValid: boolean;
  icon: Icon;
  fields: DocumentSidebarSectionField[];
  showFields: boolean;
};

export type DocumentSidebarSectionField = {
  key: string;
  isRequired: boolean;
  isValid: boolean;
  isHidden: boolean;
};
