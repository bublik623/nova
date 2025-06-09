import { useContentAnalyticsApi } from "@/features/core-shared/composables/useContentAnalyticsApi";
import { useLogger } from "@/features/core-shared/composables/useLogger";
import { AvailableLanguage } from "@/types/Language";
import { useQuery } from "@tanstack/vue-query";

const STALE_TIME = 1000 * 60; // 1 minute

export function useChangeLogsQuery({
  idRef,
  languageRef,
}: {
  idRef: Ref<string | undefined>;
  languageRef: Ref<AvailableLanguage | undefined>;
}) {
  const { getChangeLogs } = useContentAnalyticsApi();

  const isEnabled = computed(() => !!idRef.value && !!languageRef.value);

  return useQuery({
    queryKey: ["change-logs", idRef, languageRef],
    enabled: isEnabled,
    queryFn: async () => {
      if (!idRef.value || !languageRef.value) {
        return;
      }

      const { logError } = useLogger();
      const now = new Date();
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      try {
        const { data } = await getChangeLogs({
          experience_id: idRef.value,
          language_code: languageRef.value,
          start_date: oneYearAgo.toISOString(),
          end_date: now.toISOString(),
        });

        return data;
      } catch (error) {
        logError("load-activity-log", error);
        throw error;
      }
    },
    staleTime: STALE_TIME,
  });
}
