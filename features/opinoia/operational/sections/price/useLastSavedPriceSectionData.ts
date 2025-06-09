import { useOptionsQuery } from "../options/queries/useOptionsQuery";
import { useInternalPricingsQuery } from "./queries/useInternalPricingsQuery";
import { Price } from "./types";
import { InternalPricing } from "@/types/generated/OfferServiceApi";
import { fixPricingDate } from "@/features/opinoia/shared/utils/date-utils";

export function useLastSavedPriceSectionData(experienceId: Ref<string | undefined>) {
  const optionsQuery = useOptionsQuery(experienceId);
  const optionIds = computed(() => optionsQuery.data.value?.map((option) => option.id!) ?? []);
  const internalPricingsQueries = useInternalPricingsQuery(optionIds);
  const isLoading = computed(() => optionsQuery.isLoading.value || internalPricingsQueries.isLoading.value);

  const prices = computed(() => {
    return internalPricingsQueries.data.value?.map(mapInternalPricingToPrice) ?? [];
  });

  return {
    isLoading,
    data: computed(() => ({ prices: prices.value })),
  };
}

function mapInternalPricingToPrice(internalPricing: InternalPricing): Price {
  return {
    id: internalPricing.id!,
    option_id: internalPricing.option_id!,
    dateFrom: internalPricing.date_from ? fixPricingDate(internalPricing.date_from) : "",
    dateTo: internalPricing.date_to ? fixPricingDate(internalPricing.date_to) : "",
    currency: internalPricing.currency,
    languages: internalPricing.languages ?? [],
    days: internalPricing.days,
    paxPrices: internalPricing.prices.map((price) => ({
      paxType: price.pax,
      cost: price.cost,
      initialPrice: price.initial,
      suggestedPrice: price.suggested,
    })),
  };
}
