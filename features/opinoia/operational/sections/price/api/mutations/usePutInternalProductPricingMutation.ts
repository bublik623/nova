import { InternalPricing } from "@/types/generated/OfferServiceApi";
import { useMutation } from "@tanstack/vue-query";

export type PutInternalProductPricingMutationPayload = InternalPricing & { id: string };

export function usePutInternalProductPricingMutation() {
  const { putInternalProductPricing } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["internal-pricing", "put"],
    mutationFn: (internalProductPricing: PutInternalProductPricingMutationPayload) =>
      putInternalProductPricing(internalProductPricing),
  });
}
