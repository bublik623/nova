import { useLastSavedOptionsSectionData } from "./composables/useLastSavedOptionsSectionData";
import { cloneDeep } from "lodash";
import { OptionsSectionData, Option } from "./types";
import { defineStore } from "pinia";
import { useOptionsSectionSaveOperation } from "./composables/useOptionsSectionSaveOperation";
import { DeepReadonly } from "vue";

export const useOptionsSection = defineStore("opinoia-options-section", () => {
  const experienceId = ref<string | undefined>(undefined);
  const { isLoading, data: lastSavedData } = useLastSavedOptionsSectionData(experienceId);
  const { isSaving, save: saveFn } = useOptionsSectionSaveOperation(experienceId);
  const workingCopyData = ref<OptionsSectionData>({ options: [] });
  watch(lastSavedData, updateWorkingCopy, {
    immediate: true,
    deep: true,
  });

  // TODO: add proper validation logic
  const validationErrors = computed<string[]>(() => []);

  const canSave = computed(() => validationErrors.value.length === 0);

  function setExperienceId(newExperienceId: string) {
    experienceId.value = newExperienceId;
  }

  async function save() {
    await saveFn(lastSavedData.value, workingCopyData.value);
  }

  /**
   * Update the working copy, avoiding replacing the original options array
   * to ensure that the vue reactivity system react to the change.
   *
   * @param lastSavedData: the last saved data to which the working copy have to be aligned
   */
  function updateWorkingCopy(lastSavedData: DeepReadonly<OptionsSectionData> | undefined) {
    if (isLoading.value || !lastSavedData) return;

    const newOptions = cloneDeep(toRaw(lastSavedData?.options)) as Option[];
    workingCopyData.value.options.splice(0, workingCopyData.value.options.length, ...newOptions);
  }

  return {
    isLoading,
    isSaving,
    lastSavedData,
    workingCopyData,
    validationErrors,
    canSave,
    setExperienceId,
    save,
  };
});
