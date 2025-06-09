<template>
  <DocumentFormSection id="pricing.experience-type">
    <NovaRadioCardGroup
      :model-value="document.fields.experience_type!.value"
      :options="experienceTypeOptions"
      :readonly="isReadonly"
      @update:model-value="handleExperienceTypeChange($event as ExperienceType)"
    />
  </DocumentFormSection>

  <DocumentFormSection v-if="noCalendarSelected" id="pricing.expiration-date">
    <NovaRadioCardGroup
      :readonly="isReadonly"
      class="w-2/3"
      :model-value="document.fields.experience_type!.value"
      :options="expirationDateOptions"
      @update:model-value="handleExperienceTypeChange($event as ExperienceType)"
    />
  </DocumentFormSection>

  <DocumentFormSection id="pricing.currency" required :slot-max-width="325">
    <NovaSelect
      :selected="currencies ? currencies[document.fields.currency!.value] : undefined"
      :options="currencies ? Object.values(currencies) : []"
      :placeholder="$t('input.option.placeholder')"
      :readonly="isReadonly"
      @select:option="document.fields.currency!.value = $event.value"
    >
      <template #default="{ option }">
        <NovaIconFlag class="mr-2" :country-code="(option as CurrencyOption).flag" />

        {{ option.label }}
      </template>
    </NovaSelect>
  </DocumentFormSection>

  <DocumentFormSection id="pricing.instant-confirmation">
    <NovaInputRadioGroup
      v-model="document.fields.instant_confirmation!.value"
      layout="vertical"
      name="pricing.instant-confirmation"
      :options="confirmationOptions"
      :readonly="isReadonly"
      :readonly-placeholder="$t('common.no-content')"
    >
      <template #default="{ option }">
        {{ option.label }}

        <NovaLabel v-if="option.value" class="ml-2" size="sm">
          {{ $t("common.recommended") }}
        </NovaLabel>
      </template>
    </NovaInputRadioGroup>
    <template v-if="document.fields.instant_confirmation!.value === false">
      <NovaAlert class="mt-4" status="info">
        {{ $t("experience.pricing.confirmation-time.alert") }}
      </NovaAlert>
    </template>
  </DocumentFormSection>

  <DocumentFormSection v-if="!document.fields.instant_confirmation!.value" id="pricing.confirmation-time" required>
    <DocumentDurationInput v-model="document.fields.confirmation_time!.value" :disabled="isReadonly" />
  </DocumentFormSection>

  <DocumentFormSection v-if="useFeatureFlag('pax_enabled')" id="pax_types" :required="paxesStore.fields.paxes.required">
    <FieldPax
      :errors="paxesStore.errors"
      :model-value="paxesStore.fields.paxes.value"
      @update:model-value="handlePaxesChange"
    />
  </DocumentFormSection>

  <DocumentFormSection v-if="!noCalendarSelected" id="pricing.cutoff-time">
    <DocumentDurationInput
      v-model="document.fields.cutoff_time!.value"
      data-testid="cutoff-time-input"
      :readonly="isReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection id="refund_policies" :required="refundPoliciesStore.field.required">
    <FieldCancellationPolicies v-model="refundPoliciesStore.field.value" :experience-id="id" :readonly="isReadonly" />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { useExperienceRaw } from "@/stores/experience-raw";
import { Option } from "@/types/Option";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import { convertDurationToSeconds } from "@/utils/convert-duration";
import { useAsyncConfirmModal } from "@/features/core-shared/composables/useAsyncConfirmModal";
import { RawPageProps } from "@/features/experience-raw/types/pages";
import { mapCurrencyOptions } from "@/features/experience-shared/utils/currency-utils";
import { useMasterData } from "@/stores/master-data";
import NovaRadioCardGroup from "@/ui-kit/NovaRadioCardGroup/NovaRadioCardGroup.vue";
import FieldCancellationPolicies from "@/features/experience-shared/components/FieldCancellationPolicies.vue";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import { useLegacyStores } from "@/features/experience-raw/stores/useLegacyStores";
import FieldPax from "@/features/experience-raw/components/FieldPax/FieldPax.vue";
import type { Pax } from "@/types/generated/OfferServiceApi";
import { usePaxesStore } from "@/features/experience-raw/stores/usePaxesStore";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";

defineProps<RawPageProps>();
const experienceRaw = useExperienceRaw();
const { $t } = useNuxtApp();
const { params } = useRoute();
const id = params.id as string;
const document = computed(() => experienceRaw.rawContents[id]);
const refundPoliciesStore = useRefundPoliciesStore();

const legacyStores = useLegacyStores();

const paxesStore = usePaxesStore();
function handlePaxesChange(newValue: Pax[]) {
  paxesStore.setPaxes(newValue);
  paxesStore.setHasChanges(true);
  legacyStores.hasChanges = true;
}

if (document == null) {
  throw new Error(`Could not load raw document with id: ${id}, make sure it's loaded in the store.`);
}
// get currencies
const masterData = useMasterData();

const currencies = computed(() => {
  return mapCurrencyOptions(masterData.currencies);
});

// experience type
const noCalendarSelected = computed(
  () =>
    document.value.fields.experience_type!.value === ExperienceType.NO_CALENDAR_FIXED_END ||
    document.value.fields.experience_type!.value === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
);

// Instant confirmation
const confirmationOptions: RadioOption[] = [
  {
    label: $t("common.yes"),
    value: true,
  },
  {
    label: $t("common.no"),
    value: false,
  },
];

// we need to tie the instant confirmation value to the
// required state of the confirmation time.
// we don't have a minimum confirmation time different
// from the instant confirmation time (P0Y0...), so we have to manually manage it.
watch(
  () => document.value.fields.instant_confirmation?.value,
  () => {
    document.value.fields.confirmation_time!.required = !document.value.fields.instant_confirmation?.value;
  }
);

// needed because confirmation time should never be higher than cutoff time
watch(
  [() => document.value.fields.confirmation_time!.value, () => document.value.fields.cutoff_time!.value],
  ([newConf, newCut], [oldConf, _]) => {
    if (convertDurationToSeconds(newCut) < convertDurationToSeconds(newConf)) {
      if (newConf === oldConf) {
        document.value.fields.confirmation_time!.value = document.value.fields.cutoff_time!.value;
      } else {
        document.value.fields.cutoff_time!.value = document.value.fields.confirmation_time!.value;
      }
    }
  },
  { immediate: true }
);

const handleExperienceTypeChange = async (selectedType: ExperienceType) => {
  const { openModal } = useAsyncConfirmModal({
    title: $t("experience.pricing.change_experience_type.title"),
    description: $t("experience.pricing.change_experience_type.description"),
    ctaConfirmText: $t("common.confirm"),
    ctaCancelText: $t("modal.experience.exit.btn.leave"),
  });
  const confirmed = await openModal();
  if (confirmed) {
    document.value.fields.experience_type!.value = selectedType;
  }
};

// Currency
interface CurrencyOption extends Option {
  label: string;
  flag: string;
}

watch(
  // watch all the stores used in the page
  [() => document.value.fields, () => refundPoliciesStore.field],
  (curr, prev) => {
    // needed to not trigger the watcher when raw document load
    if (curr[0] === prev[0]) {
      legacyStores.hasChanges = true;
    }
  },
  {
    deep: true,
  }
);

const noCalendarExperienceTypeValue = computed(() =>
  noCalendarSelected.value ? document.value.fields.experience_type?.value : ExperienceType.NO_CALENDAR_FIXED_END
);

// the NO-CALENDAR key is used just to differentiate the translations, is not a value accepted from the BE as experience type
// and is only used internally in the FE for the open radio card
const createExperienceCard = (type: ExperienceType | "NO-CALENDAR", overrideValue?: ExperienceType) => ({
  title: $t(`experience.pricing.experience-type.${type}.title`),
  value: overrideValue || type,
  description: $t(`experience.pricing.experience-type.${type}.description`),
});

const experienceTypeOptions = computed(() => [
  createExperienceCard(ExperienceType.CALENDAR_TIMESLOTS),
  createExperienceCard(ExperienceType.CALENDAR_NO_TIMESLOTS),
  // the NO-CALENDAR experience type (open) must be selected if the experience type is NO-CALENDAR-FIXED-END or NO-CALENDAR-FIXED-VALIDITY
  createExperienceCard("NO-CALENDAR", noCalendarExperienceTypeValue.value),
]);

const expirationDateOptions = [
  createExperienceCard(ExperienceType.NO_CALENDAR_FIXED_END),
  createExperienceCard(ExperienceType.NO_CALENDAR_FIXED_VALIDITY),
];
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.RadioCardGroup {
  display: flex;
}

.ConfirmationDuration {
  display: inline-flex;
  gap: rem(8);

  .SingleDuration {
    display: flex;
    flex-direction: column;

    &__label {
      @include font-regular(12);
    }
  }
}
</style>
