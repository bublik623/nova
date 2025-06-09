import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useQueryClient, useMutation } from "@tanstack/vue-query";
import { DISTRIBUTION_CONTENT_QUERY_KEY } from "@/features/experience-raw/queries/distribution-content-query";

export const DISTRIBUTION_CONTENT_MUTATION_KEY = "distribution-content-mutation-key";

export function useDistributionContentMutation() {
  const { patchDistributionContent } = useExperienceRawApi();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [DISTRIBUTION_CONTENT_MUTATION_KEY],
    mutationFn: async (data: Partial<DistributionContent>) => {
      if (!data.id) {
        throw new Error("id is required");
      }

      await patchDistributionContent(data.id, data);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [DISTRIBUTION_CONTENT_QUERY_KEY],
      });
    },
  });
}
