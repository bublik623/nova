import { useMutation } from "@tanstack/vue-query";

export function useDeleteInternalProductPricingMutation() {
  const { deleteInternalProductPricing } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["internal-pricing", "put"],
    mutationFn: (id: string) => deleteInternalProductPricing(id),
  });
}
