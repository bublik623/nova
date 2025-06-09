<template>
  <ExperienceFormWrapper
    v-bind="$attrs"
    :show-save-and-go-next="true"
    :is-readonly="isReadonly"
    :is-save-enabled="pricingStore.isPricingFormValid"
    :is-saving-draft="isSaving"
    @click:navigate="$router.push(nextSection)"
    @click:save-and-navigate="handleSaveAll(true)"
  >
    <template v-if="!optionsStore.isLoading">
      <PricingForm
        v-if="optionsStore.state.option?.pricing_type_allowed"
        :option-id="optionId"
        :is-curation="isCuration"
        :pricing-cards="pricingStore.state.pricingCards"
        :pricing-type="optionsStore.state.option?.pricing_type_allowed"
        :readonly="isReadonly"
        :currency="currency"
        @create:pricing-card="pricingStore.handleAddPricing(optionId, optionsStore.state.option.pricing_type_allowed)"
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
          :cta-enabled="pricingStore.isPricingFormValid"
          :cta-loading="isSaving"
          @click:action="handleSaveAll" />

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
import { usePricingStore } from "@/features/experience-calendar/store/usePricingStore";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useOptionDangerousChanges } from "@/features/experience-calendar/composables/useOptionDangerousChanges";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { watchDebounced } from "@vueuse/shared";
import { useNotifications } from "@/stores/notifications";
import PricingForm from "@/features/experience-calendar/components/PricingForm.vue";
import { CalendarPageProps } from "@/features/experience-calendar/types/PageProps";
import { useMasterData } from "@/stores/master-data";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

defineProps<CalendarPageProps>();

const { $t } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const { id, optionId, flow } = route.params as Record<string, string>;

const optionsStore = useExperienceOptionsStore();
const experienceRaw = useExperienceRaw();
const rawDocument = computed(() => experienceRaw.rawContents[id]);
const pricingStore = usePricingStore();
const notification = useNotifications();
const { getCurrencyByCode } = useMasterData();
const { logError } = useLogger();

const isCuration = route.params.flow === "curation";
const nextSection = "availability";

if (optionsStore.state.option?.pricing_type_allowed == null) {
  throw new Error("Pricing type must be defined");
}

const currency = computed(() => {
  const c = getCurrencyByCode(rawDocument.value.fields.currency!.value);
  if (!c) {
    throw new Error("Currency must be defined");
  }
  return c;
});

if (!pricingStore.state.pricingCards.length) {
  // if there are no pricing add a default
  pricingStore.handleAddPricing(optionId, optionsStore.state.option?.pricing_type_allowed);
}

// SAVING

const isSaving = ref(false);

const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    await handleSaveAll(true);
  },
});

watchDebounced(
  () =>
    pricingStore.state.pricingCards.map(({ pricingName, holders }) => ({
      pricingName,
      ...holders.map(({ cardTitle, fields }) => ({ cardTitle, fields })),
    })),
  () => {
    hasUnsavedChanges.value = pricingStore.state.pricingCards.length > 0;
  },
  {
    deep: true,
    debounce: 120,
    maxWait: 500,
  }
);

const { handleDangerousChanges, hasDangerousChanges } = useOptionDangerousChanges();

function confirmDangerousChanges() {
  return hasDangerousChanges.value
    ? handleDangerousChanges({
        textMessage: $t("experience.options.dangerous_changes_modal.update_availability"),
        confirmMessage: $t("experience.options.dangerous_changes_modal.confirm_update"),
      })
    : true;
}

async function handleSaveAll(redirectToNextSection = false) {
  const userConfirms = await confirmDangerousChanges();

  if (userConfirms) {
    isSaving.value = true;

    try {
      isSaving.value = true;
      await pricingStore.save(optionId);

      notification.addNotification({
        theme: "success",
        message: "notifications.success.saving.document",
      });

      if (hasDangerousChanges.value) {
        await refreshNuxtData();
      }

      // This is needed because the pricing store
      // has a debounced validation which runs after 500ms
      // we need it to validate (and emit) before
      // we reset the changes values.,,
      await new Promise((resolve) => setTimeout(resolve, 550));

      hasUnsavedChanges.value = false;
      hasDangerousChanges.value = false;

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
}

const isPublishing = ref(false);

async function handlePublish() {
  isPublishing.value = true;
  await handleSaveAll();

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

.form {
  height: fit-content;
  max-width: rem(1056);
  padding: rem(20) 0;
  padding-bottom: rem(200);
  width: 100%;
}
</style>
