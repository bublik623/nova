import { cloneDeep } from "lodash";
import { defineStore } from "pinia";
import { useLastSavedConfigurationSectionData } from "./useLastSavedConfigurationSectionData";
import { ConfigurationSectionData } from "./types";
import { useConfigurationSectionSaveOperation } from "./useConfigurationSectionSaveOperation";
import { useNotifications } from "@/stores/notifications";

export const useConfigurationSection = defineStore("opinoia-configuration-section", () => {
  const experienceId = ref<string>("");
  const { isLoading, data: lastSavedData } = useLastSavedConfigurationSectionData(experienceId);
  const { isSaving, save: saveFn } = useConfigurationSectionSaveOperation(experienceId);
  const notificationStore = useNotifications();

  const workingCopyData = ref(getWorkingCopyInitialValue());

  // TODO: add proper validation logic
  const canSave = computed(() => true);

  watch(
    lastSavedData,
    (newLastSavedData) => {
      updateWorkingCopy(newLastSavedData);
    },
    {
      immediate: true,
      deep: true,
    }
  );

  function setExperienceId(newExperienceId: string) {
    experienceId.value = newExperienceId;
  }

  /**
   * It returns the initial value for the working copy of the section data
   * @returns lastSavedData value if it's already available,
   * othewise the default initial value for the section data.
   */
  function getWorkingCopyInitialValue(): ConfigurationSectionData {
    return lastSavedData.value
      ? cloneDeep(lastSavedData.value)
      : {
          configuration: {
            experienceCode: { value: "" },
            paxes: { value: [] },
            languages: { value: [] },
            refundPolicies: { value: [] },
          },
        };
  }

  /**
   * Update the working copy, avoiding replacing the original options array
   * to ensure that the vue reactivity system react to the change.
   *
   * @param lastSavedData: the last saved data to which the working copy have to be aligned
   */
  function updateWorkingCopy(lastSavedData: ConfigurationSectionData) {
    const newConfiguration = cloneDeep(lastSavedData?.configuration ?? {});
    workingCopyData.value = {
      configuration: { ...workingCopyData.value.configuration, ...newConfiguration },
    };
  }

  async function save() {
    try {
      await saveFn(lastSavedData.value, workingCopyData.value);
      notificationStore.addNotification({
        theme: "success",
        message: "notifications.success.saving.document",
      });
    } catch (error) {
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.saving.document",
      });
    }
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
