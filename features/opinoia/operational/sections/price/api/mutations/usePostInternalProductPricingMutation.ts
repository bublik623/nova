import { InternalPricing } from "@/types/generated/OfferServiceApi";
import { useMutation } from "@tanstack/vue-query";

export type PostInternalProductPricingMutationPayload = Omit<InternalPricing, "id">;

export function usePostInternalProductPricingMutation() {
  const { postInternalProductPricing } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["internal-pricing", "post"],
    mutationFn: (internalProductPricing: PostInternalProductPricingMutationPayload) =>
      postInternalProductPricing(internalProductPricing),
  });
}
