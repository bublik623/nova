<template>
  <DocumentFormSection
    id="emergency_contact"
    :required="requiredFields.includes('emergencyContact')"
    :slot-max-width="300"
  >
    <NovaPhoneNumber
      :number="values?.emergencyContact?.number"
      :prefix="values?.emergencyContact?.country_calling_code"
      :countries="countriesOptions"
      :placeholders="{
        phoneNumberInput: $t('experience.raw.customer.info.phone.placeholder'),
        phonePrefixSearch: $t('experience.raw.customer.info.phone.prefix.search'),
        noItemFound: $t('common.search.no-items-found'),
        readonlyEmpty: $t('common.no-content'),
      }"
      :readonly="true"
    />
  </DocumentFormSection>

  <DocumentFormSection id="voucher_type" :required="requiredFields.includes('voucherType')">
    <NovaInputRadioGroup
      :model-value="values?.voucherType"
      data-testid="voucher-type-field"
      layout="vertical"
      name="voucher_type.options"
      :options="voucherTypeOptions"
      :readonly="true"
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

  <DocumentFormSection id="info_voucher" :required="requiredFields.includes('infoVoucher')">
    <NovaTextEditor
      :model-value="values?.infoVoucher"
      :placeholder="$t('experience.voucher.editor.placeholder')"
      data-testid="info_voucher-textarea"
      :readonly="true"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import NovaPhoneNumber from "@/ui-kit/NovaPhoneNumber/NovaPhoneNumber.vue";
import { RevisionFormProps } from "../types/forms";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { BookingInformation } from "@/types/generated/MetadataExperiencesApi";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { useMasterData } from "@/stores/master-data";

const { $t } = useNuxtApp();

defineProps<RevisionFormProps>();
const masterdata = useMasterData();
const countriesOptions = masterdata.geoCountries;

const voucherTypeOptions: {
  label: string;
  value: BookingInformation["voucher_type"];
}[] = [
  { label: $t("experience.voucher-type.option.mobile"), value: "MOBILE" },
  { label: $t("experience.voucher-type.option.printed"), value: "PRINTED" },
];
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
