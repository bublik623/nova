<script setup lang="ts">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import PaxPriceField from "./PaxPricingField.vue";
import { PaxPricing, PaxType } from "./PricingFormPaxPricingTypes";
import { Currency } from "@/types/generated/ContractMasterDataApi";

export type PricingFormPaxPriceListItemProps = {
  paxType: PaxType;
  currency: Currency;
  isSelected: boolean;
  readonly: boolean;
};
export interface PricingFormPaxPriceListItemEvents {
  (e: "toggleSelection", paxTypeCode: string): void;
}
const props = defineProps<PricingFormPaxPriceListItemProps>();
const paxPricing = defineModel<PaxPricing>();
const emit = defineEmits<PricingFormPaxPriceListItemEvents>();

function toggleSelection() {
  emit("toggleSelection", props.paxType.code);
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-row items-center">
      <NovaCheckbox
        :value="paxType.code"
        :label="paxType.label"
        :status="isSelected ? 'checked' : 'unchecked'"
        :data-testid="`holder-${paxType.code}-pricing`"
        :disabled="readonly"
        class="inline-block mr-4"
        @update:status="toggleSelection"
      />
      <span v-if="!paxType.allAges" class="inline-block text-sm font-normal"
        >{{ paxType.ageFrom }} - {{ paxType.ageTo }}</span
      >
      <span v-else class="inline-block text-sm font-normal">All ages</span>
    </div>
    <PaxPriceField
      v-if="isSelected"
      v-model="paxPricing!.pricing"
      :pax-type="paxType"
      :currency="currency"
      :readonly="readonly"
      class="ml-6 mt-2 mb-1"
    />
  </div>
</template>
