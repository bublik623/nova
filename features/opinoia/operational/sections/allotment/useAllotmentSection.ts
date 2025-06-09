import { cloneDeep } from "lodash";
import { defineStore } from "pinia";
import { AllotmentSectionData } from "./types";
import { useLastSavedAllotmentSectionData } from "./useLastSavedAllotmentSectionData";
import { useAllotmentSectionSaveOperation } from "./composables/useAllotmentSectionSaveOperation/useAllotmentSectionSaveOperation";

export const useAllotmentSection = defineStore("opinoia-allotment-section", () => {
  const experienceId = ref<string>("");
  const { isLoading, data: lastSavedData } = useLastSavedAllotmentSectionData(experienceId);
  const { isSaving, save: saveFn } = useAllotmentSectionSaveOperation(readonly(experienceId));
  const workingCopyData = ref<AllotmentSectionData>({ allotments: [] });

  watch(isLoading, (newIsLoading) => {
    if (!newIsLoading) {
      updateWorkingCopy(lastSavedData.value);
    }
  });

  function setExperienceId(newExperienceId: string) {
    experienceId.value = newExperienceId;
  }

  /**
   * Update the working copy, avoiding replacing the original options array
   * to ensure that the vue reactivity system react to the change.
   *
   * @param lastSavedData: the last saved data to which the working copy have to be aligned
   */
  function updateWorkingCopy(lastSavedData: AllotmentSectionData) {
    if (isLoading.value || !lastSavedData) return;
    const newAllotment = cloneDeep(toRaw(lastSavedData?.allotments) ?? []);
    workingCopyData.value.allotments.splice(0, workingCopyData.value.allotments.length, ...newAllotment);
  }

  // TODO: add validation logic
  const canSave = computed(() => {
    return true;
  });

  async function save() {
    await saveFn(lastSavedData.value, workingCopyData.value);
  }

  return {
    isLoading,
    isSaving,
    lastSavedData,
    workingCopyData,
    setExperienceId,
    canSave,
    save,
  };
});
