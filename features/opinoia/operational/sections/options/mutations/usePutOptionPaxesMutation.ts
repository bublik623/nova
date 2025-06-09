import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { OptionPaxes } from "@/types/generated/OfferServiceApi";

export type PutOptionPaxesMutationPayload = OptionPaxes & { option_id: string };

export function usePutOptionPaxesMutation() {
  const { putOptionPaxes } = useOfferServiceApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["option-paxes", "put"],
    mutationFn: (optionPaxes: PutOptionPaxesMutationPayload) => putOptionPaxes(optionPaxes.option_id, optionPaxes),
    onSuccess: ({ data }) => queryClient.invalidateQueries({ queryKey: ["option-paxes", data.option_id!] }),
  });
}
