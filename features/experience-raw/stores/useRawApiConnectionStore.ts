import { FormField } from "@/types/Form";
import { ExperienceExternalCatalog } from "@/types/generated/ExperienceRawServiceApi";
import { defineStore } from "pinia";
import { useNotifications } from "@/stores/notifications";
import { useExternalExperiencesQuery, useExternalLinkedExperienceQuery } from "../queries/external-experiences-query";
import { useDistributionContentStore } from "@/features/experience-shared/stores/useDistributionContentStore";
import { useExternalLinkedExperienceMutation } from "../queries/external-experiences-mutation";

export interface ApiConnectionFields {
  event: FormField<string | undefined, true>;
}

export const useRawApiConnectionStore = defineStore("rawApiConnectionStore", () => {
  const notificationStore = useNotifications();

  const isLoadingEvents = computed(() => externalExperienceQuery.isLoading.value);
  const isLinkingEvent = ref(false);
  const eventList = computed<ExperienceExternalCatalog[]>(() => externalExperienceQuery.data.value || []);
  const distributionContentStore = useDistributionContentStore();
  const supplierId = computed(() => distributionContentStore.values.supplier_id);
  const linkedEvent = computed(() => externalLinkedExperienceQuery.data.value);
  const experienceId = computed(() => distributionContentStore.values.id);

  const isEventChanged = computed(() => linkedEvent.value?.id !== apiIntegrationStoreFields.value.event.value);
  const shouldLinkEvent = computed(() => isEventChanged.value && !!apiIntegrationStoreFields.value.event.value);
  const shouldUnlinkEvent = computed(
    () => !!linkedEvent.value?.id && (apiIntegrationStoreFields.value.event.value === undefined || isEventChanged.value)
  );
  const isInitialized = computed(() => !externalLinkedExperienceQuery.isLoading.value);
  const enabled = computed(() => distributionContentStore.values.experience_source === "SIP");

  const apiIntegrationStoreFields = ref<ApiConnectionFields>({
    event: { value: undefined, required: true, category: "api-connection" },
  });
  const externalExperienceQuery = useExternalExperiencesQuery(supplierId);
  const externalLinkedExperienceQuery = useExternalLinkedExperienceQuery(experienceId, enabled);
  const externalLinkedExperienceMutation = useExternalLinkedExperienceMutation();

  externalLinkedExperienceQuery.suspense().catch(() => {
    notificationStore.addNotification({
      theme: "error",
      message: "notifications.error.fetching.external-linked-experience",
    });
  });

  const loadEventList = async () => {
    try {
      await externalExperienceQuery.refetch();
    } catch (err) {
      notificationStore.addNotification({
        theme: "error",
        message: "notifications.error.fetching.external-experiences",
      });
    }
  };

  watchEffect(() => {
    apiIntegrationStoreFields.value.event.value = linkedEvent.value?.id;
  });

  function getEventById(id: string) {
    return (
      eventList.value.find((event) => event.id === id) || (linkedEvent.value?.id === id ? linkedEvent.value : undefined)
    );
  }

  function resetEvent() {
    apiIntegrationStoreFields.value.event.value = linkedEvent.value?.id || undefined;
  }

  async function linkEvent() {
    const experienceRefCode = distributionContentStore.values.reference_code;
    const eventId = apiIntegrationStoreFields.value.event.value;
    const previousLinkToRemove = linkedEvent.value?.id;

    if (!eventId) {
      throw new Error("event id is missing");
    }
    if (!experienceId.value) {
      throw new Error("experience id is missing");
    }
    if (!experienceRefCode) {
      throw new Error("experience reference code is missing");
    }

    await externalLinkedExperienceMutation.link.mutateAsync({
      eventId,
      experienceId: experienceId.value,
      experienceRefCode,
      previousLinkToRemove,
    });
  }

  async function unlinkEvent() {
    const eventId = linkedEvent.value?.id;
    if (!eventId) {
      throw new Error("event id is missing");
    }

    await externalLinkedExperienceMutation.unlink.mutateAsync({
      eventId,
    });
  }

  const isSaving = computed(() => isLinkingEvent.value);

  async function save() {
    if (shouldLinkEvent.value) {
      await linkEvent();
      return;
    }
    if (shouldUnlinkEvent.value) {
      await unlinkEvent();
    }
  }

  function $reset() {
    return resetEvent();
  }

  const hasChanges = computed(() => shouldLinkEvent.value || shouldUnlinkEvent.value);

  return {
    fields: apiIntegrationStoreFields,
    isLoadingEvents,
    isSaving,
    eventList,
    linkedEvent,
    isInitialized,
    // for the moment we only have one field so we can track has changes like this
    hasChanges,
    loadEventList,
    enabled,
    getEventById,
    resetEvent,
    save,
    $reset,
  };
});
