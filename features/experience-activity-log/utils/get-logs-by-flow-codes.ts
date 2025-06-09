import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { Log } from "@/types/generated/ContentAnalyticsApi";
import { LogsGroupedByDate, LogWithMessage, groupLogsByDate } from "./change-logs";
import { filterChangeLogs } from "./filter-change-logs";
import { removeSystemActivityLogs } from "./remove-system-activities";

export function getLogsByFlowCodes(
  logs: Log[],
  codes: ExperienceFlowCode[]
): {
  groupedLogs: LogsGroupedByDate;
  unusedLogs: string[];
  lastActivity: LogWithMessage | undefined;
  lastEditDate: string | undefined;
  filteredLogs: LogWithMessage[];
} {
  const { accepted, rejected } = filterChangeLogs(logs, codes);

  const unusedLogs = Array.from(new Set(rejected.map((log) => `${log.entity}.${log.field}`)));

  const filteredLogs = accepted;
  const lastActivity = findFirstValidActivity();
  const lastEditDate = lastActivity?.action_date;
  const groupedLogs = groupLogsByDate(filteredLogs);

  return { groupedLogs, unusedLogs, lastActivity, lastEditDate, filteredLogs };

  function findFirstValidActivity() {
    const [firstValidLog] = removeSystemActivityLogs(filteredLogs);

    return firstValidLog;
  }
}
