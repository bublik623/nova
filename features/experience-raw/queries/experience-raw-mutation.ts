import { RawElement } from "@/types/generated/ExperienceRawServiceApi";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { RAW_EXPERIENCE_QUERY_KEY } from "@/features/experience-raw/queries/experience-raw-query";

export const RAW_EXPERIENCE_MUTATION_KEY = "raw-experience-mutation-key";

export function useExperienceRawMutation() {
  const { updateExperienceRaw } = useExperienceRawApi();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [RAW_EXPERIENCE_MUTATION_KEY],
    mutationFn: async (
      data: Partial<RawElement> & {
        experience_id: string;
        id: string;
      }
    ) => {
      const { id, ...rest } = data;

      await updateExperienceRaw(id, {
        ...rest,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [RAW_EXPERIENCE_QUERY_KEY],
      });
    },
  });
}
