import { MappedCategory, SidebarCategoryField, SidebarSections } from "@/types/DocumentSidebar";
import { FormField } from "@/types/Form";
import { fieldValidator } from "@/utils/field-validator";

/**
 * Maps a `SidebarSections` object to an object where each key is a string representing a sidebar section, and each value is a `MappedCategory` object.
 *
 * @param {SidebarSections} sidebarSection - The object representing the sidebar sections to map.
 * @returns {{ [key: string]: MappedCategory }} An object where each key is a string representing a sidebar section, and each value is a `MappedCategory` object.
 */
export const mapSidebarSections = (sidebarSection: SidebarSections): { [key: string]: MappedCategory } => {
  const categories = sidebarSection;
  const mappedCategories: { [key: string]: MappedCategory } = {};

  for (const [key, category] of Object.entries(categories)) {
    if (!category.hide) {
      const sidebarFields = category.fields;

      const requiredFields = sidebarFields.filter((field) => field.required);
      const required = requiredFields.length > 0;

      const completed = required ? requiredFields.every((f) => f.filled) : sidebarFields.every((f) => f.filled);
      const disabled = category.disabledBy
        ? !category.disabledBy?.every((el) => mappedCategories[el].completed)
        : false;

      const section = {
        id: key,
        url: category.url,
        disabled,
        fields: category.fields,
        required,
        completed,
        icon: category.icon,
        disabledBy: category.disabledBy?.pop() as string,
        dropdown: !category.noDropdown,
      };
      mappedCategories[key] = section;
    }
  }
  return mappedCategories;
};

export const createField = (
  id: string,
  field?: FormField<any, boolean | undefined>,
  provideValue?: Partial<SidebarCategoryField>
): SidebarCategoryField => {
  return {
    id,
    required: field?.required,
    filled: fieldValidator(field),
    hide: provideValue?.hide ?? false,
    ...provideValue,
  };
};
