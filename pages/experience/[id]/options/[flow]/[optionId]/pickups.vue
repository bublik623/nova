<template>
  <ExperienceFormWrapper v-bind="$attrs" :show-save-and-go-next="false">
    <div>
      <PickupsForm
        v-model:has-pickup-service="pickupsStore.hasPickupService"
        :is-curation-flow="isCuration"
        :initial-values="{
          selectedPickups: pickupsStore.fields.selectedPickups.value,
          contactEmail: pickupsStore.fields.contactEmail.value,
          contactPhoneNumber: pickupsStore.fields.contactPhoneNumber.value,
        }"
        :data="{ pickups: pickupsStore.pickupPlacesData, countries: masterDataStore.geoCountries }"
        :readonly="isReadonly"
        @submit="handleFormUpdate"
        @pickup-created="handlePickupCreated"
      ></PickupsForm>
    </div>
  </ExperienceFormWrapper>

  <ActionBar>
    <template #actions>
      <span v-if="!isReadonly">
        <ActionBarCta
          id="save-content"
          :title="$t('action-bar.options.save.title')"
          :description="$t('action-bar.options.save.tip')"
          :cta-text="$t('action-bar.options.save.button')"
          :cta-type="'outline'"
          :cta-enabled="pickupsStore.isFormValid"
          :cta-loading="pickupsStore.isSaving"
          @click:action="handleSave" />

        <ActionBarCta
          id="complete-option"
          :title="$t('action-bar.options.complete-option.title')"
          :description="$t('action-bar.options.complete-option.tip')"
          :cta-text="$t('action-bar.options.complete-option.button')"
          :cta-enabled="optionsStore.canPublish"
          :cta-loading="isPublishing"
          @click:action="handlePublish()"
      /></span>
    </template>
  </ActionBar>
</template>

<script setup lang="ts">
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { watchDebounced } from "@vueuse/shared";
import PickupsForm, { PickupsFormValues } from "@/features/experience-calendar/components/PickupsForm.vue";
import { usePickupsStore } from "@/features/experience-calendar/store/usePickupsStore";
import { useMasterData } from "@/stores/master-data";
import { PickupPlaceWithId } from "@/features/experience-calendar/types/Pickups";
import { CalendarPageProps } from "@/features/experience-calendar/types/PageProps";
import { cloneDeep, isEqual } from "lodash";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

defineProps<CalendarPageProps>();

const { $t } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const { id, optionId, flow } = route.params as Record<string, string>;
const optionsStore = useExperienceOptionsStore();
const pickupsStore = usePickupsStore();
const masterDataStore = useMasterData();

const notification = useNotifications();
const { logError } = useLogger();

const experienceRaw = useExperienceRaw();
const rawDocument = computed(() => experienceRaw.rawContents[id]);
const isCuration = computed(() => route.params.flow === "curation");
const pickupStoreInitialState = cloneDeep(pickupsStore.fields);

const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    await handleSave();
  },
});

watchDebounced(
  () => pickupsStore.fields,
  (pickupStoreCurrentState) => {
    if (!isEqual(pickupStoreInitialState, pickupStoreCurrentState)) {
      hasUnsavedChanges.value = true;
    } else {
      hasUnsavedChanges.value = false;
    }
  },
  {
    deep: true,
    debounce: 150,
  }
);

const handleFormUpdate = (data: PickupsFormValues) => {
  pickupsStore.fields.selectedPickups.value = data.selectedPickups;
  pickupsStore.fields.contactPhoneNumber.value = data.contactPhoneNumber;
  pickupsStore.fields.contactEmail.value = data.contactEmail;
};

async function handlePickupCreated(pickup: PickupPlaceWithId) {
  pickupsStore.fields.selectedPickups.value.push(pickup);
  await pickupsStore.loadPickupPlaces();
}

async function handleSave() {
  try {
    await pickupsStore.saveForm(optionId);
    hasUnsavedChanges.value = false;
    notification.addNotification({
      theme: "success",
      message: "notifications.success.saving.document",
    });
  } catch (error) {
    logError("update-option", error);
    notification.addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
  }
}

const isPublishing = ref(false);
async function handlePublish() {
  isPublishing.value = true;
  await handleSave();
  try {
    await optionsStore.publishOption(optionId, { ...rawDocument.value.data.offerExperience! });

    router.push({
      name: `experience-id-${flow}-options`,
      params: { id },
    });
  } catch (error) {
    logError("update-option", error);
    notification.addNotification({
      theme: "error",
      message: "notifications.error.publishing.option",
    });
  } finally {
    isPublishing.value = false;
  }
}
</script>
