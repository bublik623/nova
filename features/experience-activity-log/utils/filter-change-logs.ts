import { NOT_FOUND_DEFAULT } from "@/constants/i18n.constants";
import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { Log } from "@/types/generated/ContentAnalyticsApi";
import flow from "lodash.flow";
import {
  LogWithMessage,
  filterLogsByFlow,
  mapStatusChangeToLabel,
  groupAdditionalServiceExtraInfo,
  aggregateLogsByField,
  sortLogsByDate,
  cleanLogFieldNames,
} from "./change-logs";

/**
 * This internal function is used to apply all the necessary transformation to the logs we receive from BE and to filter them
 * @param logs
 * @param flowCodes
 * @param statuses
 */
export function filterChangeLogs(
  logs: Log[],
  flowCodes: ExperienceFlowCode[]
): { accepted: LogWithMessage[]; rejected: LogWithMessage[] } {
  const { $t } = useNuxtApp();

  const cleanedLogs: Log[] = flow([
    (l) => filterLogsByFlow(l, flowCodes),
    (l) => mapStatusChangeToLabel(l),
    groupAdditionalServiceExtraInfo,
    (l) => aggregateLogsByField(l, /market/),
    sortLogsByDate,
    cleanLogFieldNames,
  ])(logs);

  // Separate used and unused logs (we are using Weblate as a 'whitelist' for the fields)
  const [accepted, rejected] = cleanedLogs.reduce<[LogWithMessage[], LogWithMessage[]]>(
    (res, log) => {
      const message = $t(`changelog.field.${log.entity}.${log.field}`, {
        default: NOT_FOUND_DEFAULT,
      } as any); // I've opened a MR to fix this type issue: https://source.tui/dx/shared-resources/translations/i18n/-/merge_requests/4

      message !== NOT_FOUND_DEFAULT
        ? // @ts-expect-error - action shouldn't be overridden, we need to return with the correct type when refactoring this
          res[0].push({ ...log, message, action: $t(`changelog.action.${log.action}`) })
        : res[1].push({ ...log, message });

      return res;
    },
    [[], []]
  );

  return { accepted, rejected };
}
