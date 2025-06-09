<template>
  <ExperienceFormWrapper
    v-bind="$attrs"
    data-testid="AvailabilityIndexPage"
    :is-readonly="isReadonly"
    :is-save-enabled="isSavingEnabled"
    :is-saving-draft="isSaving"
    :show-save-and-go-next="true"
    @click:navigate="$router.push(nextSection)"
    @click:save-and-navigate="handleSave(true)"
  >
    <template v-if="!optionsStore.isLoading">
      <AvailabilityForm
        :is-curation="isCuration"
        :option-id="optionId"
        :experience-type="experienceType"
        :readonly="isReadonly"
      />
    </template>
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
          :cta-enabled="isSavingEnabled"
          :cta-loading="isSaving"
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
import { Ref } from "vue";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import { useNotifications } from "@/stores/notifications";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { watchDebounced } from "@vueuse/shared";
import AvailabilityForm from "@/features/experience-calendar/components/AvailabilityForm.vue";
import { CalendarPageProps } from "@/features/experience-calendar/types/PageProps";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

defineProps<CalendarPageProps>();

const { $t } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const { id, optionId, flow } = route.params as Record<string, string>;
const notification = useNotifications();
const { logError } = useLogger();
const experienceRaw = useExperienceRaw();
const optionsStore = useExperienceOptionsStore();

const isCuration = flow === "curation";
const nextSection = "customer-details";

const rawDocument = computed(() => experienceRaw.rawContents[id]);
const experienceType: Ref<ExperienceType> = computed(() => rawDocument.value.fields.experience_type!.value);

// Saving logic

const isSavingEnabled = computed(() => optionsStore.availabilitiesAreValid);
const isSaving = ref(false);

const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    await handleSave(true);
  },
});

const isFirstLoad = ref(true);

watchDebounced(
  () =>
    optionsStore.state.availabilities.map(({ value: { option, name, ...fields } }) => ({
      option,
      name,
      fields,
    })),
  () => {
    // the form emits an update even on first load, irregardless of the user input.
    // we need to filter out this first event to have an accurate detection of changes
    if (isFirstLoad.value) {
      isFirstLoad.value = false;
    } else {
      hasUnsavedChanges.value = true;
    }
  },
  {
    deep: true,
    debounce: 120,
    maxWait: 500,
  }
);

async function handleSave(redirectToNextSection = false) {
  try {
    isSaving.value = true;
    await optionsStore.saveAvailabilities(experienceType.value);

    // This is needed because the availability store
    // has a debounced validation which runs after 500ms
    // we need it to validate (and emit) before
    // we reset the changes values.,,
    await new Promise((resolve) => setTimeout(resolve, 550));

    hasUnsavedChanges.value = false;

    notification.addNotification({
      theme: "success",
      message: "notifications.success.saving.document",
    });

    if (redirectToNextSection) {
      router.push(nextSection);
    }
  } catch (error) {
    logError("update-option", error);
    notification.addNotification({
      theme: "error",
      message: "notifications.error.saving.document",
    });
  } finally {
    isSaving.value = false;
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

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.timeslot {
  &__wrapper {
    display: grid;
    gap: rem(16);
  }
}
</style>
