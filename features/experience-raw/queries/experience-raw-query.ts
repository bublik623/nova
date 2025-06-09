import { useQuery } from "@tanstack/vue-query";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";

export const RAW_EXPERIENCE_QUERY_KEY = "raw-experience-query-key";

export function useExperienceRawQuery(idRef: Ref<string | undefined>) {
  const isEnabled = computed(() => !!idRef.value);

  const { getExperienceRawV2ByExperienceId } = useExperienceRawApi();

  return useQuery({
    queryKey: [RAW_EXPERIENCE_QUERY_KEY, idRef],
    queryFn: () => {
      if (idRef.value == null) {
        throw new Error("Experience ID is required");
      }

      return getExperienceRawV2ByExperienceId(idRef.value);
    },
    select: ({ data }) => data,
    enabled: isEnabled,
  });
}
