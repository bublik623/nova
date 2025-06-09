import { defineStore, acceptHMRUpdate } from "pinia";
import { useChangeLogsQuery } from "../queries/change-logs-query";
import { AvailableLanguage } from "@/types/Language";
import { useRouteParams } from "@vueuse/router";
import { getSelectedCodesFromUrl } from "../utils/get-selected-codes-from-url";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { getLogsByFlowCodes } from "../utils/get-logs-by-flow-codes";

export const useActivityLogStore = defineStore("useActivityLogStore", () => {
  const route = useRoute();
  const idRef = useRouteParams<string>("id", "");
  const languageRef = useRouteParams<AvailableLanguage>("language", "en");

  const query = useChangeLogsQuery({ idRef, languageRef });

  const logs = computed(() => query.data.value?.logs || []);
  const loading = computed(() => query.isLoading.value);
  const error = computed(() => query.isError.value);

  const currentLogs = computed(() => {
    const codes = getSelectedCodesFromUrl(route.fullPath);
    return getLogsByFlowCodes(logs.value || [], codes);
  });

  const lastEditDate = computed(() => currentLogs.value.lastEditDate);
  const groupedLogs = computed(() => currentLogs.value.groupedLogs);

  return {
    lastEditDate,
    groupedLogs,
    loading,
    error,
    $reset: () => {},
    getBySelectedCodes: (codes: ExperienceFlowCode[]) => getLogsByFlowCodes(logs.value, codes),
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useActivityLogStore, import.meta.hot));
}
