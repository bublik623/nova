import { useQuery } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export function useConfigurationExperienceQuery(experienceId: Readonly<Ref<string | undefined>>) {
  const { getExperience } = useOfferServiceApi();

  return useQuery({
    queryKey: ["configuration-experience", experienceId],
    enabled: computed(() => !!experienceId.value),
    queryFn: () => getExperience(experienceId.value || ""),
    select: (response) => response.data,
  });
}
