<template>
  <ExperienceFormWrapper
    v-bind="$attrs"
    :is-readonly="isReadonly"
    :is-save-enabled="customerDetailsStore.isFormValid"
    :is-saving-draft="customerDetailsStore.isSaving"
    :show-save-and-go-next="true"
    @click:navigate="$router.push(nextSection)"
    @click:save-and-navigate="handleSave(true)"
  >
    <NovaFieldHeading
      :title="$t('experience.customer-details.title')"
      :description="$t('experience.customer-details.description')"
      required
      class="mb-4"
    ></NovaFieldHeading>
    <div>
      <CustomerDetailsForm
        :questions="customerDetailsStore.bookingQuestions"
        :initial-data="customerDetailsStore.fields"
        :readonly="isReadonly"
        @update="handleFormUpdate"
      ></CustomerDetailsForm>
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
          :cta-enabled="customerDetailsStore.isFormValid"
          :cta-loading="customerDetailsStore.isSaving"
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
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";
import CustomerDetailsForm from "@/features/experience-calendar/components/CustomerDetailsForm.vue";
import { useCustomerDetailsStore } from "@/features/experience-calendar/store/useCustomerDetailsStore";
import { BookingQuestion as ExperienceBookingQuestion } from "@/types/generated/MetadataExperiencesApi";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { watchDebounced } from "@vueuse/shared";
import { CalendarPageProps } from "@/features/experience-calendar/types/PageProps";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

defineProps<CalendarPageProps>();
const nextSection = "pickups";

const { $t } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const experienceId = computed(() => route.params.id as string);
const { id, optionId, flow } = route.params as Record<string, string>;
const optionsStore = useExperienceOptionsStore();
const customerDetailsStore = useCustomerDetailsStore();
const notification = useNotifications();
const { logError } = useLogger();

const experienceRaw = useExperienceRaw();
const rawDocument = computed(() => experienceRaw.rawContents[id]);

const handleFormUpdate = (data: ExperienceBookingQuestion[]) => {
  customerDetailsStore.setQuestions(data);
};

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
  () => customerDetailsStore.fields.questions.value,
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
    await customerDetailsStore.saveForm(experienceId.value, optionId);
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
  }
}

const isPublishing = ref(false);
async function handlePublish() {
  isPublishing.value = true;
  try {
    await handleSave();
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
