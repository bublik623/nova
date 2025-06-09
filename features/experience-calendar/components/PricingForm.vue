<template>
  <NovaFieldHeading
    :title="$t('experience.pricing.title')"
    :description="$t('experience.pricing.description')"
    required
    class="mb-4"
  />
  <template v-for="(pricing, index) in pricingCards" :key="pricing.cardId">
    <PricingFormPricingCard
      :model-value="pricing"
      :option-id="optionId"
      :index="index"
      :readonly="readonly"
      :pricing-type="pricingType"
      :currency="currency"
    />
  </template>
  <div>
    <NovaButton v-if="!readonly" size="sm" data-testid="add-pricing" @click="emits('create:pricingCard')">
      &plus; {{ $t("experience.pricing.add-pricing") }}
    </NovaButton>
  </div>
</template>

<script setup lang="ts">
import { Currency } from "@/types/generated/ContractMasterDataApi";
import { Pricing } from "@/types/generated/OfferServiceApiOld";
import { PricingCard } from "@/types/Pricing";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";
import PricingFormPricingCard from "./PricingFormPricingCard.vue";

interface Props {
  optionId: string;
  isCuration: boolean;
  pricingCards: PricingCard[];
  pricingType: Pricing["pricing_type"];
  readonly?: boolean;
  currency: Currency;
}

interface Events {
  (e: "create:pricingCard"): void;
}

defineProps<Props>();
const emits = defineEmits<Events>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
