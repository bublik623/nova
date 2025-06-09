import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { useQuery } from "@tanstack/vue-query";

export const DISTRIBUTION_CONTENT_QUERY_KEY = "distribution-content-query-key";

export function useDistributionContentQuery(idRef: Ref<string | undefined>) {
  const isEnabled = computed(() => !!idRef.value);

  const { getDistributionContent } = useExperienceRawApi();

  return useQuery({
    queryKey: [DISTRIBUTION_CONTENT_QUERY_KEY, idRef],
    queryFn: () => {
      if (idRef.value == null) {
        throw new Error("Experience ID is required");
      }

      return getDistributionContent(idRef.value);
    },
    select: ({ data }) => data,
    enabled: isEnabled,
  });
}
