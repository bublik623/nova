<template>
  <ExperienceFormWrapper
    v-bind="$attrs"
    id="OptionsSettingsPage"
    :is-readonly="isReadonly"
    :is-save-enabled="validation.formIsValid.value"
    :is-saving-draft="isSaving"
    :show-save-and-go-next="true"
    @click:save-and-navigate="handleSave(true)"
    @click:navigate="$router.push(nextSection)"
  >
    <template v-if="optionDocument">
      <DocumentFormSection id="option.name" :required="true" :slot-max-width="325">
        <div class="mb-2">
          <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
        </div>
        <NovaInputText
          id="option_name"
          v-model="optionDocument.name"
          :placeholder="$t('option.name.input.placeholder')"
          :error="validation.getFieldErrors('name')"
          :disabled="areCommercialFieldsEditable"
        />
      </DocumentFormSection>
      <DocumentFormSection
        v-show="selectedView !== 'commercial'"
        id="option.duration"
        :required="true"
        :slot-max-width="325"
      >
        <DocumentDurationInput
          v-model="optionDocument.duration"
          :error="!isReadonly ? validation.getFieldErrors('duration') : ''"
          :disabled="isReadonly"
        />
      </DocumentFormSection>
      <DocumentFormSection v-if="!isOpenExp" id="option.pricing-definition" :slot-max-width="325">
        <div class="RadioCardGroup">
          <NovaRadioCard
            :title="$t(`options.pricing-definition.person.title`)"
            :value="PricingDefinition.PERSON"
            :checked="optionDocument.pricing_type_allowed === PricingDefinition.PERSON"
            :disabled="isReadonly"
            @input="optionDocument.pricing_type_allowed = PricingDefinition.PERSON"
          >
            <template #description>
              {{ $t(`options.pricing-definition.person.description`) }}
            </template>
          </NovaRadioCard>

          <NovaRadioCard
            :title="$t(`options.pricing-definition.group.title`)"
            :value="PricingDefinition.GROUP"
            :checked="optionDocument.pricing_type_allowed === PricingDefinition.GROUP"
            :disabled="isReadonly"
            @input="
              {
                (optionDocument.capacity_type = CapacityType.SHARED),
                  (optionDocument.pricing_type_allowed = PricingDefinition.GROUP);
              }
            "
          >
            <template #description>
              {{ $t(`options.pricing-definition.group.description`) }}
            </template>
          </NovaRadioCard>
        </div>
      </DocumentFormSection>
      <DocumentFormSection v-show="selectedView !== 'commercial'" id="option.languages" required :slot-max-width="640">
        <NovaInputRadioGroup
          id="option-languages"
          :model-value="optionDocument.multilanguage"
          data-testid="option-language-radio"
          layout="vertical"
          name="option-languages"
          :options="languageOptions"
          :readonly="isReadonly"
          :readonly-placeholder="$t('common.no-content')"
          @update:model-value="(e) => handleMultilanguageSelection(e as boolean)"
        />
        <div v-if="optionDocument.multilanguage" class="mt-4">
          <OptionLanguagesDropdown
            v-model:selected-items="selectedLanguages"
            :model-value="languagesAsOptions"
            :error="validation.getFieldErrors('allowed_languages')"
            :is-readonly="isReadonly"
          />
        </div>
      </DocumentFormSection>
      <DocumentFormSection v-show="selectedView !== 'commercial'" id="option.capacity">
        <NovaInputRadioGroup
          v-if="optionDocument.pricing_type_allowed === PricingDefinition.PERSON"
          id="option-capacity"
          v-model="optionDocument.capacity_type"
          data-testid="option-capacity-radio"
          layout="vertical"
          name="option-capacity"
          :options="capacityOptions"
          :readonly="isReadonly"
          :readonly-placeholder="$t('common.no-content')"
        />
        <div v-if="optionDocument.capacity_type != CapacityType.UNLIMITED" class="RadioCardGroup">
          <NovaRadioCard
            :title="createCapacityCardLabel(CapacityType.SHARED, 'title')"
            :value="CapacityType.SHARED"
            :checked="optionDocument.capacity_type === CapacityType.SHARED"
            :disabled="isReadonly"
            @input="optionDocument!.capacity_type = CapacityType.SHARED"
          >
            <template #description>
              <UtilsRenderHtml :string="createCapacityCardLabel(CapacityType.SHARED, 'description')" /> </template
          ></NovaRadioCard>

          <NovaRadioCard
            v-if="!isOpenExp"
            :title="createCapacityCardLabel(CapacityType.PAX, 'title')"
            :value="CapacityType.PAX"
            :checked="optionDocument.capacity_type === CapacityType.PAX"
            :disabled="isReadonly"
            @input="optionDocument!.capacity_type = CapacityType.PAX"
            ><template #description>
              <UtilsRenderHtml :string="createCapacityCardLabel(CapacityType.PAX, 'description')" /> </template
          ></NovaRadioCard>

          <NovaRadioCard
            v-if="optionDocument.multilanguage"
            :title="createCapacityCardLabel(CapacityType.LANGUAGE, 'title')"
            :value="CapacityType.LANGUAGE"
            :checked="optionDocument.capacity_type === CapacityType.LANGUAGE"
            :disabled="isReadonly"
            @input="optionDocument!.capacity_type = CapacityType.LANGUAGE"
          >
            <template #description>
              <UtilsRenderHtml :string="createCapacityCardLabel(CapacityType.LANGUAGE, 'description')" />
            </template>
          </NovaRadioCard>
        </div>
      </DocumentFormSection>
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
          :cta-enabled="validation.formIsValid.value"
          :cta-loading="isSaving"
          @click:action="handleSave"
        />

        <ActionBarCta
          id="complete-option"
          :title="$t('action-bar.options.complete-option.title')"
          :description="$t('action-bar.options.complete-option.tip')"
          :cta-text="$t('action-bar.options.complete-option.button')"
          :cta-enabled="optionsStore.canPublish && !useOptionDangerousChanges"
          :cta-loading="isPublishing"
          @click:action="handlePublish()"
        />
      </span>
    </template>
  </ActionBar>
</template>

<script setup lang="ts">
import { isoDuration, en } from "@musement/iso-duration";
import ActionBar from "@/features/experience-shared/components/ActionBar.vue";
import ActionBarCta from "@/features/experience-shared/components/ActionBarCta.vue";
import { useNotifications } from "@/stores/notifications";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { CapacityType, PricingDefinition } from "@/types/Options";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaRadioCard from "@/ui-kit/NovaRadioCard/NovaRadioCard.vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useExperienceOptionsStore } from "@/features/experience-calendar/store/useExperienceOptionsStore";
import { useOptionValidation } from "@/features/experience-calendar/composables/useOptionValidation";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { useOptionDangerousChanges } from "@/features/experience-calendar/composables/useOptionDangerousChanges";
import { useUnsavedChanges } from "@/features/experience-calendar/composables/useUnsavedChanges";
import { watchDebounced } from "@vueuse/shared";
import { CalendarPageProps } from "@/features/experience-calendar/types/PageProps";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import {
  mapOptionsToLanguagesPayload,
  mapLanguagesPayloadToOption,
  mapMasterdataLanguagesToOptions,
} from "@/features/experience-calendar/utils/option-language-utils";
import OptionLanguagesDropdown, {
  LanguageOption,
} from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";
import { areNonCommercialFieldsEditableForUser } from "@/features/experience-curation/lib/viewTypeUtils";
import ExperienceFormWrapper from "@/features/experience-shared/components/ExperienceFormWrapper.vue";

const props = defineProps<CalendarPageProps>();

const { $t } = useNuxtApp();
const { params } = useRoute();
const router = useRouter();
const experienceRaw = useExperienceRaw();
const { logError } = useLogger();
const { id, optionId, flow } = params as Record<string, string>;
const optionsStore = useExperienceOptionsStore();
const areCommercialFieldsEditable = computed(() => props.isReadonly && areNonCommercialFieldsEditableForUser());

const nextSection = "pricing";

const isOpenExp = computed(
  () =>
    rawDocument.value.data.offerExperience!.type === ExperienceType.NO_CALENDAR_FIXED_END ||
    rawDocument.value.data.offerExperience!.type === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
);

isoDuration.setLocales({
  en,
});

const notification = useNotifications();

const rawDocument = computed(() => experienceRaw.rawContents[id]);

if (rawDocument == null) {
  throw new Error(`Could not load raw document with id: ${id}, make sure it's loaded in the store.`);
}
const expType = rawDocument.value.data.offerExperience!.type.toLowerCase() as ExperienceType;

const createCapacityCardLabel = (capacityType: CapacityType, label: "title" | "description") =>
  $t(`options.capacity-type.${capacityType}.${optionDocument?.value?.pricing_type_allowed}.${label}.${expType}`);

const optionDocument = computed(() => optionsStore.state.option);

const languageOptions = [
  { label: $t("common.yes"), value: true },
  { label: $t("common.no"), value: false },
];
const { availableLanguages } = useMasterData();
const languagesAsOptions = computed<LanguageOption[]>(() => mapMasterdataLanguagesToOptions(availableLanguages));
const selectedLanguages = computed<LanguageOption[]>({
  get: () => optionDocument.value?.allowed_languages?.map(mapLanguagesPayloadToOption) ?? [],
  set: (languages: LanguageOption[]) => {
    optionDocument.value!.allowed_languages = mapOptionsToLanguagesPayload(languages);
  },
});

const capacityOptions = computed(() => [
  {
    label: $t("experience.option.capacity.unlimited"),
    value: CapacityType.UNLIMITED,
  },
  {
    label: $t("experience.option.capacity.limited"),
    value:
      optionDocument.value?.capacity_type !== "unlimited" ? optionDocument.value?.capacity_type : CapacityType.SHARED,
  },
]);

function handleMultilanguageSelection(e: boolean) {
  if (optionDocument.value == null) {
    return;
  }
  optionDocument.value.multilanguage = e;
  if (optionDocument.value.capacity_type === CapacityType.LANGUAGE) {
    optionDocument.value.capacity_type = CapacityType.SHARED;
  }
}

// Saving and validation
const validation = useOptionValidation(optionDocument, {
  immediate: true,
});

const isSaving = ref(false);

const { hasUnsavedChanges } = useUnsavedChanges({
  cancelCallback: async () => {
    await refreshNuxtData();
  },
  confirmCallback: async () => {
    await handleSave(true);
  },
});

watchDebounced(
  () => optionDocument.value,
  () => {
    hasUnsavedChanges.value = true;
  },
  {
    deep: true,
    debounce: 120,
    maxWait: 500,
  }
);

const {
  handleDangerousChanges,
  hasDangerousChanges,
  resetDangerousChanges,
  hasAllowedLanguagesChanges,
  showAllowedLanguagesChangesWarning,
} = useOptionDangerousChanges();

function confirmDangerousChanges() {
  if (hasDangerousChanges.value) {
    return handleDangerousChanges({
      textMessage: $t("experience.options.dangerous_changes_modal.reset_availability"),
      confirmMessage: $t("experience.options.dangerous_changes_modal.confirm_reset"),
    });
  }

  if (hasAllowedLanguagesChanges.value) {
    return showAllowedLanguagesChangesWarning();
  }

  return true;
}

async function handleSave(redirectToNextSection = false) {
  const userConfirms = await confirmDangerousChanges();

  if (optionDocument.value && userConfirms) {
    isSaving.value = true;

    try {
      await optionsStore.updateOption(optionId);

      if (hasDangerousChanges.value || hasAllowedLanguagesChanges.value) {
        await refreshNuxtData();
      }

      resetDangerousChanges();
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

.OptionDuration {
  display: inline-flex;
  gap: rem(8);
}

.SingleDuration {
  display: flex;
  flex-direction: column;

  &__label {
    @include font-regular(12);
  }
}

.title {
  padding: rem(10) 0;
  margin-bottom: rem(-10);
  border-bottom: var(--border-light);
}

.RadioCardGroup {
  display: flex;
  margin-top: rem(16);
  width: rem(900);
  gap: rem(16);

  label {
    max-width: rem(357);
  }
}
</style>
