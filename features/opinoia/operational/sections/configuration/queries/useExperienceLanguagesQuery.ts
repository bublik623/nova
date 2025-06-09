import { useQuery } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export function useExperienceLanguagesQuery(experienceId: Readonly<Ref<string | undefined>>) {
  const { getExperienceLanguages } = useOfferServiceApi();

  return useQuery({
    queryKey: ["experience-languages", experienceId],
    enabled: computed(() => !!experienceId.value),
    queryFn: () => getExperienceLanguages(experienceId.value || ""),
    select: (response) => response.data,
  });
}
