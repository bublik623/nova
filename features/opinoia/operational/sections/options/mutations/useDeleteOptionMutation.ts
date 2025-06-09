import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export function useDeleteOptionMutation(experienceId: Ref<string | undefined>) {
  const { deleteOption } = useOfferServiceApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["option", "delete"],
    mutationFn: (optionId: string) => deleteOption(optionId),
    onSuccess: async (_, optionId) => {
      // Invalidate options query for experience id
      await queryClient.invalidateQueries({ queryKey: ["options", experienceId] });

      // Remove query cache associated with option paxes of the removed option
      queryClient.removeQueries({ queryKey: ["option-paxes", optionId] });
    },
  });
}
