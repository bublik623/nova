<template>
  <DocumentFormSection
    id="emergency_contact"
    :required="bookingInfoFields.emergency_contact.required"
    :slot-max-width="300"
  >
    <NovaPhoneNumber
      v-model:number="bookingInfoFields.emergency_contact.value.number"
      v-model:prefix="bookingInfoFields.emergency_contact.value.country_calling_code"
      :countries="masterDataStore.geoCountries"
      :placeholders="{
        phoneNumberInput: $t('experience.raw.customer.info.phone.placeholder'),
        phonePrefixSearch: $t('experience.raw.customer.info.phone.prefix.search'),
        noItemFound: $t('common.search.no-items-found'),
        readonlyEmpty: $t('common.no-content'),
      }"
      :readonly="isReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection id="voucher_type" :required="bookingInfoFields.voucher_type.required">
    <NovaInputRadioGroup
      v-model="bookingInfoFields.voucher_type.value"
      data-testid="voucher-type-field"
      layout="vertical"
      name="voucher_type.options"
      :options="voucherTypeOptions"
      :readonly="isReadonly"
      :readonly-placeholder="$t('common.no-content')"
    >
      <template #default="{ option }">
        {{ option.label }}

        <NovaLabel v-if="option.value === 'MOBILE'" class="ml-2" size="sm" theme="secondary">
          {{ $t("common.recommended") }}
        </NovaLabel>
      </template>
    </NovaInputRadioGroup>
  </DocumentFormSection>

  <DocumentFormSection id="info_voucher" :required="document.fields.info_voucher.required">
    <NovaTextEditor
      v-model="document.fields.info_voucher.value"
      :style="{ maxWidth: '425px' }"
      :placeholder="$t('experience.voucher.editor.placeholder')"
      data-testid="info_voucher-textarea"
      :disabled="isDisabledDuringCuration('voucher_instructions', document.data.status_code)"
      :readonly="isReadonly"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { useBookingInformationStore } from "@/features/experience-shared/stores/useBookingInformationStore";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useMasterData } from "@/stores/master-data";
import { BookingInformation } from "@/types/generated/MetadataExperiencesApi";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NovaPhoneNumber from "@/ui-kit/NovaPhoneNumber/NovaPhoneNumber.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { storeToRefs } from "pinia";
import { RawPageProps } from "@/features/experience-raw/types/pages";
import { isDisabledDuringCuration } from "@/features/experience-raw/utils/experience-raw-utils";
import { useLegacyStores } from "@/features/experience-raw/stores/useLegacyStores";

defineProps<RawPageProps>();

const { $t } = useNuxtApp();
const bookingInfoStore = useBookingInformationStore();
const masterDataStore = useMasterData();
const { bookingInfoFields } = storeToRefs(bookingInfoStore);
const experienceRaw = useExperienceRaw();
const { params } = useRoute();
const id = params.id as string;

const document = computed(() => experienceRaw.rawContents[id]);

const legacyStore = useLegacyStores();

if (document == null) {
  throw new Error(`Could not load raw document with id: ${id}, make sure it's loaded in the store.`);
}

const voucherTypeOptions: {
  label: string;
  value: BookingInformation["voucher_type"];
}[] = [
  { label: $t("experience.voucher-type.option.mobile"), value: "MOBILE" },
  { label: $t("experience.voucher-type.option.printed"), value: "PRINTED" },
];

watch(
  // watch all the stores used in the page
  [() => document.value.fields, () => bookingInfoFields.value],
  (curr, prev) => {
    // needed to not trigger the watcher when raw document load
    if (curr[0] === prev[0]) {
      legacyStore.hasChanges = true;
    }
  },
  {
    deep: true,
  }
);
</script>
