import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";
import { useRawSettingsStore } from "./useRawSettingsStore";
import { useExperienceRawQuery } from "../queries/experience-raw-query";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useRoute } from "vue-router";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useExperienceRawMutation } from "../queries/experience-raw-mutation";
import { useSendToReviewMutation } from "../queries/send-to-review-mutation";
import { useLegacyStores } from "./useLegacyStores";
import { useRawApiConnectionStore } from "./useRawApiConnectionStore";
import { getNextRawStatusCode } from "../lib/get-next-raw-status-code";
import { usePaxesStore } from "./usePaxesStore";

export const useRawExperienceStore = defineStore("useRawExperienceStore", () => {
  const route = useRoute();
  const idRef = computed(() => route.params.id as string);

  const notifications = useNotifications();
  const logger = useLogger();

  const experienceRawQuery = useExperienceRawQuery(idRef);
  const experienceRawMutation = useExperienceRawMutation();
  const sendToReviewMutation = useSendToReviewMutation();

  const rawSettingsStore = useRawSettingsStore();
  const distributionContentStore = useDistributionContentStore();
  const rawApiConnectionStore = useRawApiConnectionStore();
  const legacyStores = useLegacyStores();
  const paxesStore = usePaxesStore();

  const stores = [distributionContentStore, rawSettingsStore, legacyStores, rawApiConnectionStore, paxesStore];
  const enabledStores = computed(() => stores.filter((store) => store.enabled));

  const statusCode = computed(() => experienceRawQuery.data.value?.status_code);
  const productType = computed(() => distributionContentStore.productType);

  const experienceTitle = computed(() => rawSettingsStore.values.title);
  const hasTitleAndSupplier = computed<boolean>(
    () => Boolean(distributionContentStore.values.supplier_id) && Boolean(rawSettingsStore.values.title)
  );

  const isSaving = computed(() => enabledStores.value.some((store) => store.isSaving));
  const hasChanges = computed(() => enabledStores.value.some((store) => store.hasChanges));

  return {
    save,
    publish,
    isSaving,
    hasChanges,
    hasTitleAndSupplier,
    experienceTitle,
    statusCode,
    productType,
    legacyStores,
    $reset,
  };

  async function save() {
    try {
      await triggerSaveInStores();

      await updateStatusCode();

      notifications.addNotification({
        theme: "success",
        message: "notifications.success.saving.document",
      });
    } catch (error) {
      logger.logError("update-raw", error);
      notifications.addNotification({
        theme: "error",
        message: "notifications.error.saving.document",
      });
      throw error;
    }
  }

  async function publish() {
    try {
      await triggerSaveInStores();

      await sendToReviewMutation.mutateAsync(experienceRawQuery.data.value?.id);

      notifications.addNotification({
        theme: "success",
        message: "notifications.success.saving.document",
      });
    } catch (error) {
      logger.logError("publish-raw", error);
      notifications.addNotification({
        theme: "error",
        message: "notifications.error.saving.document",
      });
      throw error;
    }
  }

  async function triggerSaveInStores() {
    const promises = enabledStores.value.map((store) => store.save());
    await Promise.all(promises);
  }

  // We need to update the status code update separately, as soon™ it will be handled by the backend.
  async function updateStatusCode(
    options: {
      publish: boolean;
    } = {
      publish: false,
    }
  ) {
    if (!statusCode.value) {
      return Promise.resolve();
    }

    const { publish } = options;
    const nextStatusCode = getNextRawStatusCode(statusCode.value, publish);
    const rawId = experienceRawQuery.data.value?.id;
    const experienceId = experienceRawQuery.data.value?.experience_id;

    // If there is no next status code, we don't need to update the status code.
    if (!nextStatusCode) {
      return Promise.resolve();
    }

    if (!rawId) {
      throw new Error("Raw ID is missing");
    }

    if (!experienceId) {
      throw new Error("Experience ID is missing");
    }

    await experienceRawMutation.mutateAsync({
      status_code: nextStatusCode,
      experience_id: experienceId,
      id: rawId,
    });
  }

  function $reset() {
    enabledStores.value.forEach((store) => {
      store.$reset();
    });
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRawExperienceStore, import.meta.hot));
}
