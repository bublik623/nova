import { Icon } from "@/ui-kit/NovaIcon/NovaIcon.vue";

export type SidebarCategoryField = {
  id: string;
  title?: string;
  required: boolean | undefined;
  filled?: boolean;
  selected?: boolean;
  hide?: boolean;
  hasChange?: boolean;
};

export type SidebarCategory = {
  icon: Icon;
  fields: SidebarCategoryField[];
  completed?: boolean;
  url: string;
  disabledBy?: string[];
  noDropdown?: boolean;
  hasChange?: boolean;
  hide?: boolean;
};

export type MappedCategory = {
  id: string;
  url: string;
  disabled: boolean;
  fields: SidebarCategoryField[];
  required: boolean;
  completed: boolean;
  icon: Icon;
  disabledBy: string;
  dropdown: boolean;
  selected?: boolean;
  hasChange?: boolean;
};

export type SidebarSections = {
  [key: string]: SidebarCategory;
};
