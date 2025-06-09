import { useQuery } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export function useAllotmentQuery(experienceId: Readonly<Ref<string | undefined>>) {
  const { getAllotments } = useOfferServiceApi();

  return useQuery({
    queryKey: ["experience-allotment", experienceId],
    enabled: computed(() => !!experienceId.value),
    queryFn: () => getAllotments(experienceId.value || ""),
    select: (response) => response.data,
  });
}
