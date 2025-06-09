<template>
  <ul class="divide-y divide-neutral-60">
    <li v-for="paxType in paxTypes" :key="paxType.code" class="py-3">
      <PricingFormPaxPricingListItem
        v-model="paxPriceMap[paxType.code]"
        :pax-type="paxType"
        :is-selected="isSelected(paxType.code)"
        :currency="currency"
        :readonly="readonly"
        @toggle-selection="toggleSelection"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import { PaxPricing, PaxType } from "./PricingFormPaxPricingTypes";
import PricingFormPaxPricingListItem from "./PricingFormPaxPricingListItem.vue";
import { Currency } from "@/types/generated/ContractMasterDataApi";

export type PricingFormPaxPriceListItemProps = {
  currency: Currency;
  readonly: boolean;
  paxTypes: PaxType[];
};
const props = defineProps<PricingFormPaxPriceListItemProps>();

const paxPriceList = defineModel<PaxPricing[]>({ required: true });

const paxPriceMap = computed(() => {
  const result = props.paxTypes.reduce((record, paxType) => {
    record[paxType.code] = paxPriceList.value.filter((paxPrice) => paxPrice.paxTypeCode === paxType.code)?.[0];
    return record;
  }, {} as Record<string, PaxPricing | undefined>);

  return result;
});

function isSelected(paxTypeCode: string) {
  return paxPriceMap.value[paxTypeCode] !== undefined;
}

function toggleSelection(paxTypeCode: string) {
  if (isSelected(paxTypeCode)) {
    const indexOfPricingToRemove = paxPriceList.value.findIndex((paxPrice) => paxPrice.paxTypeCode === paxTypeCode);
    paxPriceList.value.splice(indexOfPricingToRemove, 1);
  } else {
    paxPriceList.value.push({
      id: undefined,
      paxTypeCode,
      pricing: {
        retailPrice: 0,
        commissionPercentage: 0,
        netPrice: 0,
      },
    });
  }
}
</script>
