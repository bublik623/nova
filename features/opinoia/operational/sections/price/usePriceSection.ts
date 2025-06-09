import { defineStore, acceptHMRUpdate } from "pinia";
import { useLastSavedPriceSectionData } from "./useLastSavedPriceSectionData";
import { PriceSectionData } from "./types";
import { cloneDeep } from "lodash";
import { usePriceSectionSaveOperation } from "./composables/usePriceSectionSaveOperation/usePriceSectionSaveOperation";

export const usePriceSection = defineStore("opinoia-price-section", () => {
  const experienceId = ref<string | undefined>(undefined);
  const { data: lastSavedData, isLoading } = useLastSavedPriceSectionData(experienceId);
  const { isSaving, save: saveFn } = usePriceSectionSaveOperation(readonly(experienceId));
  const workingCopyData = ref(getWorkingCopyInitialValue());

  function setExperienceId(newExperienceId: string) {
    experienceId.value = newExperienceId;
  }

  //
  watch(isLoading, (newIsLoading) => {
    if (!newIsLoading) {
      updateWorkingCopy(lastSavedData.value);
    }
  });

  // TODO: add validation logic
  const canSave = computed(() => {
    return true;
  });

  async function save() {
    await saveFn(lastSavedData.value, workingCopyData.value);
  }

  function getWorkingCopyInitialValue(): PriceSectionData {
    return lastSavedData.value.prices.length ? cloneDeep(lastSavedData.value) : { prices: [] };
  }

  function updateWorkingCopy(lastSavedData: PriceSectionData) {
    const newPrices = cloneDeep(lastSavedData?.prices ?? []);
    workingCopyData.value.prices.splice(0, workingCopyData.value.prices.length, ...newPrices);
  }

  return {
    isLoading,
    isSaving,
    lastSavedData,
    workingCopyData,
    canSave,
    save,
    setExperienceId,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePriceSection, import.meta.hot));
}
