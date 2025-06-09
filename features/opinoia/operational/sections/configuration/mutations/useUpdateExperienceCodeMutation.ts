import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";
import { useConfigurationExperienceQuery } from "../queries/useConfigurationExperienceQuery";

export function useUpdateExperienceCodeMutation(experienceId: Readonly<Ref<string>>) {
  const queryClient = useQueryClient();
  const experienceQuery = useConfigurationExperienceQuery(experienceId);
  const { updateExperience } = useOfferServiceApi();

  return useMutation({
    mutationKey: ["offer-experience-code-mutation", experienceId],
    mutationFn: (code: string) => updateExperience(experienceId.value, { ...experienceQuery.data.value, code }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuration-experience", experienceId] }),
  });
}
