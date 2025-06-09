import { useQuery } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi";

export function useOptionsQuery(experienceId: Readonly<Ref<string | undefined>>) {
  const { getOptions } = useOfferServiceApi();

  return useQuery({
    queryKey: ["options", experienceId],
    enabled: computed(() => !!experienceId.value),
    queryFn: () => getOptions(experienceId.value!),
    select: (response) => response.data,
  });
}
