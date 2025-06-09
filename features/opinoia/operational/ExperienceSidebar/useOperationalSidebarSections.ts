import { type DocumentSidebarSection } from "../../shared/ExperienceSidebar/types";
import { useSidebarAllotmentSection } from "../sections/allotment/sidebar/useSidebarAllotmentSection";
import { useSidebarConfigurationSection } from "../sections/configuration/sidebar/useSidebarConfigurationSection";
import { useSidebarOptionsSection } from "../sections/options/sidebar/useSidebarOptionsSection";
import { useSidebarPriceSection } from "../sections/price/sidebar/useSidebarPriceSection";

/**
 * Provides a reactive array of sidebar section data for the operational document.
 *
 * This composable acts as a facade, gathering data from individual section composables
 * (like `useSidebarOptionsSection`) based on the provided experience ID.
 * It returns a computed reference, ensuring the section data updates reactively
 * when the underlying data in any section changes.
 *
 * @param experienceId - A readonly ref containing the ID of the current experience.
 * @returns A readonly computed ref containing an array of `DocumentSidebarSection` objects.
 *
 * @example
 * const experienceId = ref('exp-123');
 * const sections = useOperationalSidebarSections(experienceId);
 * // sections.value will contain [{ key: 'options', ... }]
 */
// TODO: add sections as they are introduced
export function useOperationalSidebarSections(
  experienceId: Readonly<Ref<string>>
): Readonly<Ref<DocumentSidebarSection[]>> {
  const allSectionsRefs = [
    useSidebarConfigurationSection(experienceId),
    useSidebarOptionsSection(experienceId),
    useSidebarPriceSection(experienceId),
    useSidebarAllotmentSection(experienceId),
  ];
  const sections = computed(() => allSectionsRefs.map((sectionRef) => sectionRef.value));

  return sections;
}
