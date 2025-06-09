import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { Option } from "@/types/generated/OfferServiceApi";

export type PutOptionMutationPayload = Option & { id: string };

export function usePutOptionMutation(experienceId: Readonly<Ref<string | undefined>>) {
  const { putOption } = useOfferServiceApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["option", "put"],
    mutationFn: (option: PutOptionMutationPayload) => putOption(option.id, option),
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["options", experienceId] }),
  });
}
