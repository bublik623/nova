import { DocumentSidebarSection } from "@/features/opinoia/shared/ExperienceSidebar/types";
import { usePriceSection } from "../usePriceSection";

export function useSidebarPriceSection(experienceId: Readonly<Ref<string>>): Readonly<Ref<DocumentSidebarSection>> {
  const priceSection = usePriceSection();

  const isValid = computed(() => priceSection.lastSavedData.prices.length > 0); // TODO: Replace with actual validation logic once implemented

  return computed(() => ({
    key: "price",
    url: `/opinoia/${experienceId.value}/operational/price`,
    isRequired: true,
    isValid: isValid.value,
    icon: "ticket",
    fields: [
      {
        key: "price",
        isRequired: true,
        isValid: isValid.value,
        isHidden: false,
      },
    ],
    showFields: false,
  }));
}
