import { useChangeLogsQuery } from "@/features/experience-activity-log/queries/change-logs-query";
import { filterChangeLogs } from "@/features/experience-activity-log/utils/filter-change-logs";
import { AvailableLanguage } from "@/types/Language";

export type OpinoiaFlowCodes = "BASE" | "CURATION" | "MANUAL_TRANSLATION" | "AUTOTRANSLATION" | "MEDIA";

export function useActivityLogFactory(relevantFlowCodes: OpinoiaFlowCodes[]) {
  return function useActivityLog(experienceId: Readonly<Ref<string>>, languageCode: Readonly<Ref<AvailableLanguage>>) {
    const changeLogsQuery = useChangeLogsQuery({ idRef: experienceId, languageRef: languageCode });
    const allChangeLogs = computed(() => changeLogsQuery.data.value?.logs ?? []);
    const relevantChangeLogs = computed(() => filterChangeLogs(allChangeLogs.value, relevantFlowCodes).accepted);
    const lastEditDate = computed(() => relevantChangeLogs.value[0]?.action_date);

    return {
      lastEditDate,
    };
  };
}
