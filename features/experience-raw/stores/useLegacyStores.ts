import { defineStore, acceptHMRUpdate } from "pinia";
import { useRoute } from "vue-router";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { useExperienceRaw, getOfferExperiencePayload } from "@/stores/experience-raw";
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { useActivityLogStore } from "@/features/experience-activity-log/stores/useActivityLogStore";

// This is a store adapter for the legacy stores to the new store pattern
// Once we implement the roles we will see if we need to do further work
export const useLegacyStores = defineStore("useLegacyStores", () => {
  const route = useRoute();

  const id = computed(() => (route.params.id as string) || "");
  const currentPage = computed(() => route.name);

  // We track the changes manually, as most stores do not have a way to programmatically diff between the current and the initial state
  // In the store we set the hasChanges to false when saved, so we can rely on that
  const hasChanges = ref(false);
  const isSaving = ref(false);

  const experienceRaw = useExperienceRaw();
  const currentExperience = computed(() => experienceRaw.rawContents[id.value]);

  const refundPoliciesStore = useRefundPoliciesStore();
  const bookingInfoStore = useBookingInformationStore();
  const locationStore = useExperienceLocationStore();
  const activityLogStore = useActivityLogStore();

  return {
    hasChanges,
    isSaving,
    save,
    enabled: true,
    $reset,
  };

  async function save() {
    if (!hasChanges.value) {
      return Promise.resolve();
    }

    try {
      isSaving.value = true;

      await experienceRaw.updateRawDocument(id.value);

      // This is the logic from the pages, don't change the order
      if (currentPage.value === "experience-id-raw-pricing-and-availability") {
        await experienceRaw.saveSupplierId(id.value, getOfferExperiencePayload(currentExperience.value));
        await refundPoliciesStore.saveRefundPolicies();
        await experienceRaw.refetchOptions(id.value);
      }
    } finally {
      hasChanges.value = false;
      isSaving.value = false;
    }
  }

  function $reset() {
    locationStore.$reset();
    bookingInfoStore.$reset();
    refundPoliciesStore.$reset();
    activityLogStore.$reset();
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLegacyStores, import.meta.hot));
}
