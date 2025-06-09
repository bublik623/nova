<script setup lang="ts">
import PricingFormPaxPriceList from "@/features/experience-calendar/components/PricingFormPaxPricingList/PricingFormPaxPricingList.vue";
import { PaxPricing } from "@/features/experience-calendar/components/PricingFormPaxPricingList/PricingFormPaxPricingTypes";
import { masterDataPricingHolderOptions } from "@/features/experience-calendar/lib/experience-option-pricing";
import { Currency } from "@/types/generated/ContractMasterDataApi";

const currency: Currency = {
  code: "EUR",
  name: "Euro",
  symbol: "€",
};

const configuration: Record<string, { ageFrom: number; ageTo: number; allAges?: boolean; freeOfCharge: boolean }> = {
  adult: { ageFrom: 18, ageTo: 64, freeOfCharge: false },
  child: { ageFrom: 3, ageTo: 12, freeOfCharge: false },
  infant: { ageFrom: 0, ageTo: 2, freeOfCharge: true },
  youth: { ageFrom: 13, ageTo: 17, freeOfCharge: false },
  senior: { ageFrom: 65, ageTo: 99, freeOfCharge: false },
  "eu-citizen": { ageFrom: 0, ageTo: 99, allAges: true, freeOfCharge: false },
  military: { ageFrom: 0, ageTo: 99, allAges: true, freeOfCharge: false },
  "person with disability": { ageFrom: 0, ageTo: 99, allAges: true, freeOfCharge: false },
  "eu-teacher": { ageFrom: 0, ageTo: 99, allAges: true, freeOfCharge: false },
  student: { ageFrom: 0, ageTo: 99, allAges: true, freeOfCharge: false },
  caregiver: { ageFrom: 0, ageTo: 99, allAges: true, freeOfCharge: true },
};

const paxTypes = masterDataPricingHolderOptions.map((option) => {
  const defaultValues = configuration[option.value] || { ageFrom: 0, ageTo: 99 };

  return {
    code: option.value,
    label: option.label,
    ageFrom: defaultValues.ageFrom,
    ageTo: defaultValues.ageTo,
    freeOfCharge: defaultValues.freeOfCharge,
    ...(defaultValues.allAges ? { allAges: defaultValues.allAges } : {}),
  };
});

const modelValue = ref<PaxPricing[]>([]);
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-row justify-around pt-10">
      <div class="w-1/3 m-15 p-7 border border-solid border-neutral-60">
        <PricingFormPaxPriceList
          :pax-types="paxTypes"
          :model-value="modelValue"
          :currency="currency"
          :readonly="false"
          class="w-full"
        />
      </div>
      <div class="w-1/3 m-15 p-7 border border-solid border-neutral-60">
        <PricingFormPaxPriceList
          :pax-types="paxTypes"
          :model-value="modelValue"
          :currency="currency"
          :readonly="true"
          class="w-full"
        />
      </div>
    </div>

    <div class="flex flex-col m-10">
      <pre>{{ JSON.stringify(modelValue, null, "\t") }}</pre>
    </div>
  </div>
</template>
