import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { Option } from "@/types/generated/OfferServiceApi";

export type PostOptionMutationPayload = Omit<Option, "id">;

export function usePostOptionMutation(experienceId: Readonly<Ref<string | undefined>>) {
  const { postOption } = useOfferServiceApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["option", "post"],
    mutationFn: (option: PostOptionMutationPayload) => postOption(option.experience, option),
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["options", experienceId] }),
  });
}
