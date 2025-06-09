import { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";
import { useOptionsSection } from "../useOptionsSection";

/**
 * Creates the sidebar data structure specifically for the "Options" section
 * of the operational document configuration.
 *
 * This composable retrieves the core state and validation status for the options section
 * from the `useOptionsSection` Pinia store. It then augments this with information
 * relevant only to the sidebar display, such as the section's specific URL (based on the
 * experience ID), its icon, and whether it's required.
 *
 * The validity (`isValid`) of the sidebar section directly reflects the validation
 * status reported by the `useOptionsSection` store.
 *
 * @param experienceId - A readonly ref containing the ID of the current experience, used to construct the section URL.
 * @returns A readonly computed ref (`Readonly<ComputedRef<DocumentSidebarSection>>`) containing the reactive
 * sidebar data for the options section. Updates when the experience ID or the
 * validation status in the `useOptionsSection` store changes.
 *
 * @see useOptionsSection - The Pinia store providing the core state and validation for this section.
 *
 * @example
 * const experienceId = ref('exp-456');
 * const optionsSidebarData = useSidebarOptionsSection(experienceId);
 */
export function useSidebarOptionsSection(experienceId: Readonly<Ref<string>>): Readonly<Ref<DocumentSidebarSection>> {
  const optionsSection = useOptionsSection();

  const isValid = computed(() => optionsSection.validationErrors.length === 0);

  return computed(() => ({
    key: "options",
    url: `/opinoia/${experienceId.value}/operational/options`,
    isRequired: true,
    isValid: isValid.value,
    icon: "options",
    fields: [
      {
        key: "options",
        isRequired: false,
        isValid: isValid.value,
        isHidden: false,
      },
    ],
    showFields: false,
  }));
}
