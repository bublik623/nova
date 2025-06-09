import { useAllotmentSection } from "../sections/allotment/useAllotmentSection";
import { useConfigurationSection } from "../sections/configuration/useConfigurationSection";
import { useOptionsSection } from "../sections/options/useOptionsSection";
import { usePriceSection } from "../sections/price/usePriceSection";

export function useOpinoiaOperationalDocument(experienceId: Readonly<Ref<string>>) {
  const sections = [useOptionsSection(), useConfigurationSection(), usePriceSection(), useAllotmentSection()];
  const isLoading = computed(() => sections.some((section) => section.isLoading));
  const isSaving = computed(() => sections.some((section) => section.isSaving));

  watch(
    experienceId,
    (newExperienceIdValue) => {
      sections.forEach((section) => {
        section.setExperienceId(newExperienceIdValue);
      });
    },
    { immediate: true }
  );

  async function saveDraft(): Promise<void> {
    const saves = sections.map((section) => section.save());
    await Promise.all(saves);
  }

  return {
    isLoading,
    isSaving,
    canSaveDraft: true,
    canPublish: false,
    publish: () => {},
    saveDraft,
  };
}
