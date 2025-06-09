<template>
  <DocumentFormSection v-show="isAllView" id="pricing.experience-type">
    <NovaRadioCardGroup
      :model-value="curationDocument.fields.experience_type.value"
      :options="experienceTypeOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      @update:model-value="handleExperienceTypeChange($event as ExperienceType)"
    />
  </DocumentFormSection>

  <DocumentFormSection v-if="noCalendarSelected" v-show="isAllView" id="pricing.expiration-date">
    <NovaRadioCardGroup
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      class="w-2/3"
      :model-value="curationDocument.fields.experience_type.value"
      :options="expirationDateOptions"
      @update:model-value="handleExperienceTypeChange($event as ExperienceType)"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="pricing.currency" required :slot-max-width="325">
    <NovaSelect
      :selected="currencies ? currencies[curationDocument.fields.currency.value!] : undefined"
      :options="currencies ? Object.values(currencies) : []"
      :placeholder="$t('input.option.placeholder')"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      @select:option="curationDocument.fields.currency.value = $event.value"
    >
      <template #default="{ option }">
        <NovaIconFlag class="mr-2" :country-code="(option as CurrencyOption).flag" />

        {{ option.label }}
      </template>
    </NovaSelect>
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="pricing.instant-confirmation">
    <NovaInputRadioGroup
      v-model="curationDocument.fields.instant_confirmation.value"
      layout="vertical"
      name="pricing.instant-confirmation"
      :options="confirmationOptions"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :readonly-placeholder="$t('common.no-content')"
    >
      <template #default="{ option }">
        {{ option.label }}

        <NovaLabel v-if="option.value" class="ml-2" size="sm">
          {{ $t("common.recommended") }}
        </NovaLabel>
      </template>
    </NovaInputRadioGroup>
    <template v-if="curationDocument.fields.instant_confirmation.value === false">
      <NovaAlert class="mt-4" status="info">
        {{ $t("experience.pricing.confirmation-time.alert") }}
      </NovaAlert>
    </template>
  </DocumentFormSection>

  <DocumentFormSection
    v-if="!curationDocument.fields.instant_confirmation.value"
    v-show="isAllView"
    id="pricing.confirmation-time"
    required
  >
    <DocumentDurationInput v-model="curationDocument.fields.confirmation_time.value" :disabled="isReadonly" />
  </DocumentFormSection>

  <DocumentFormSection v-if="!noCalendarSelected" v-show="isAllView" id="pricing.cutoff-time">
    <DocumentDurationInput
      v-model="curationDocument.fields.cutoff_time.value"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      data-testid="cutoff-time-input"
    />
  </DocumentFormSection>

  <DocumentFormSection
    v-show="isAllView"
    id="refund_policies"
    data-testid="refund-policies"
    :required="refundPoliciesStore.field.required"
  >
    <FieldCancellationPolicies
      v-model="refundPoliciesStore.field.value"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      :experience-id="id"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { Option } from "@/types/Option";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import NovaAlert from "@/ui-kit/NovaAlert/NovaAlert.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { RadioOption } from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";
import { convertDurationToSeconds } from "@/utils/convert-duration";
import { useExperienceCuration } from "@/stores/experience-curation";
import { useExperienceRaw } from "@/stores/experience-raw";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import { useAsyncConfirmModal } from "@/features/core-shared/composables/useAsyncConfirmModal";
import { CurationPageEvents, CurationPageProps } from "@/features/experience-curation/types";
import { mapCurrencyOptions } from "@/features/experience-shared/utils/currency-utils";
import { useMasterData } from "@/stores/master-data";
import NovaRadioCardGroup from "@/ui-kit/NovaRadioCardGroup/NovaRadioCardGroup.vue";
import FieldCancellationPolicies from "@/features/experience-shared/components/FieldCancellationPolicies.vue";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";
import {
  areNonCommercialFieldsEditableForUser,
  VIEW_TYPE_COMMERCIAL,
  viewIsTypeAll,
} from "@/features/experience-curation/lib/viewTypeUtils";

const props = defineProps<CurationPageProps>();
const emit = defineEmits<CurationPageEvents>();
const curationStore = useExperienceCuration();
const experienceRaw = useExperienceRaw();
const { $t } = useNuxtApp();
const router = useRouter();
const { params } = useRoute();
const id = params.id as string;
const isAllView = computed(() => viewIsTypeAll(props.selectedView));
const areNonCommercialFieldsReadonly = computed(() => !areNonCommercialFieldsEditableForUser());

const curationDocument = computed(() => curationStore.curationDocuments[id]);
const rawDocument = computed(() => experienceRaw.rawContents[id]);
const refundPoliciesStore = useRefundPoliciesStore();

// Currencies
const masterData = useMasterData();

const currencies = computed(() => {
  return mapCurrencyOptions(masterData.currencies);
});

watch(
  () => props.selectedView,
  async () => {
    if (!isAllView.value) {
      // There are no commercial fields in this page
      await nextTick();
      await router.push(`settings?view=${VIEW_TYPE_COMMERCIAL}`);
    }
  },
  {
    immediate: true,
  }
);

if (curationDocument == null) {
  throw new Error(`Could not load curation document with id: ${id}, make sure it's loaded in the store.`);
}
if (rawDocument == null) {
  throw new Error(`Could not load curation document with id: ${id}, make sure it's loaded in the store.`);
}
// experience type
const noCalendarSelected = computed(
  () =>
    curationDocument.value.fields.experience_type.value === ExperienceType.NO_CALENDAR_FIXED_END ||
    curationDocument.value.fields.experience_type.value === ExperienceType.NO_CALENDAR_FIXED_VALIDITY
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
  () => curationDocument.value.fields.instant_confirmation.value,
  () => {
    curationDocument.value.fields.confirmation_time.required =
      !curationDocument.value.fields.instant_confirmation.value;
  }
);

// needed because confirmation time should never be higher than cutoff time
watch(
  [
    () => curationDocument.value.fields.confirmation_time.value!,
    () => curationDocument.value.fields.cutoff_time.value!,
  ],
  ([newConf, newCut], [oldConf, _]) => {
    if (convertDurationToSeconds(newCut) < convertDurationToSeconds(newConf)) {
      if (newConf === oldConf) {
        curationDocument.value.fields.confirmation_time.value = curationDocument.value.fields.cutoff_time.value;
      } else {
        curationDocument.value.fields.cutoff_time.value = curationDocument.value.fields.confirmation_time.value;
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
    curationDocument.value.fields.experience_type.value = selectedType;
  }
};

// Currency
interface CurrencyOption extends Option {
  label: string;
  flag: string;
}

watch(
  // watch all the stores used in the page
  [() => curationDocument.value.fields, () => refundPoliciesStore.field],
  (curr, prev) => {
    // needed to not trigger the watcher when curation document load
    if (curr[0] === prev[0] && !curationStore.isSaving) {
      emit("hasUnsavedChanges", true);
    }
  },
  {
    deep: true,
  }
);

// Saving
const stopBus = eventBusCuration.on(
  async (
    event,
    opt: { nextSection: string; publish: boolean; redirect: boolean; translate: boolean; force: boolean }
  ) => {
    if (event === "SAVE") {
      saveCurationContent({
        promise: async () => {
          await experienceRaw.saveSupplierId(id, getOfferExperiencePayloadCuration(curationDocument.value));
          await refundPoliciesStore.saveRefundPolicies();
          await experienceRaw.refetchOptions(id);
        },
        afterSaving: () => {
          eventBusCuration.emit("SAVED", opt);
        },
        id,
        nextSection: opt?.nextSection,
        redirect: opt?.redirect,
        translate: opt?.translate,
        publish: opt?.publish,
        force: opt?.force,
      });
    }
  }
);
onBeforeUnmount(() => stopBus());

const noCalendarExperienceTypeValue = computed(() =>
  noCalendarSelected.value ? curationDocument.value.fields.experience_type.value : ExperienceType.NO_CALENDAR_FIXED_END
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

.title {
  padding: rem(10) 0;
  margin-bottom: rem(-10);
  border-bottom: var(--border-light);
}

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
