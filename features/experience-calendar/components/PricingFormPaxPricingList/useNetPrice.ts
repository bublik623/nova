import { Pricing } from "@/features/experience-calendar/components/PricingFormPaxPricingList/PricingFormPaxPricingTypes";
import { DeepReadonly } from "vue";

export function useNetPrice(pricing: DeepReadonly<Ref<Pricing>>) {
  const commissionAmount = computed(() => {
    const pricingValue = pricing.value;
    const commissionAmountNonRounded = (pricingValue.retailPrice / 100) * pricingValue.commissionPercentage;
    return Math.round((commissionAmountNonRounded + Number.EPSILON) * 100) / 100;
  });

  const netPrice = computed(() => {
    return pricing.value.retailPrice - commissionAmount.value;
  });

  return netPrice;
}
