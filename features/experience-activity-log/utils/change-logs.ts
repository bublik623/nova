import { ExperienceFlowCode } from "@/types/DocumentStatuses";
import { FunctionalGroupCodeSchema } from "@/types/DocumentTypes";
import { Log } from "@/types/generated/ContentAnalyticsApi";

export type LogWithMessage = Log & { message: string };

export interface LogsGroupedByDate {
  [timestamp: string]: LogWithMessage[];
}

/**
 * Groups logs based on the timestamp
 * @param logs Logs to group
 */
export function groupLogsByDate(logs: LogWithMessage[]): LogsGroupedByDate {
  return logs.reduce((group, changelog) => {
    const actionDateWithoutTime = changelog.action_date.split("T")[0];
    const changeDate = new Date(actionDateWithoutTime).getTime();

    if (group[changeDate]) {
      group[changeDate].push(changelog);
    } else {
      group[changeDate] = [changelog];
    }

    return group;
  }, {} as LogsGroupedByDate);
}

/**
 * Sort logs based on the timestamp
 * @param logs Logs to sort
 * @returns A new array of logs sorted by timestamp
 */
export function sortLogsByDate(logs: Log[]) {
  return [...logs].sort((logA, logB) => new Date(logB.action_date).getTime() - new Date(logA.action_date).getTime());
}

// additional services entity name on the API
const ADDITIONAL_SERVICES_ENTITY = "extendedexperienceadditionalservices";

/**
 * Filter logs matching the field property to a regex
 * @param logs Logs to filter
 * @param regex Regex used to filter the logs
 */
export function filterLogsByFlow(logs: Log[], flowCodes: ExperienceFlowCode[]): Log[] {
  const filteredLogs = logs.filter((log) => flowCodes.includes((log.flow_code as ExperienceFlowCode) || "BASE"));

  // add additional services to the filtered logs if the flow_code is not present and the `entity` value is "extendedexperienceadditionalservices"
  const logsWithWorkaround = filteredLogs.concat(logs.filter(isAdditionalServicesLog));

  return logsWithWorkaround;
}

function isAdditionalServicesLog(log: Log): boolean {
  return log.entity === ADDITIONAL_SERVICES_ENTITY && !log.flow_code;
}

/**
 * Removes digits and slashes from a Log field name, and formats it to dot case
 * @param log Log to clean
 */
export function cleanLogFieldNames(logs: Log[]) {
  return logs.map((l) => ({
    ...l,
    field: l.field
      .replace(/(?<=\/)\d/, "")
      .replace(/(^\/|\/$)/g, "")
      .replace(/\/+/g, ".")
      .toLowerCase(),
  }));
}

/**
 * Maps status changes to labels in logs
 *
 * This function processes logs, adding a "_published" suffix to the field
 * name when the new status is "READY".
 *
 * @example
 * given this log
 * ```json
 * [{ "field": "status_code", "new_value": "READY" }]
 * ```
 * the function will return
 * ```json
 * [{"field": "status_code_published", "new_value": "READY"}]
 * ```
 *
 * and on Weblate we have a translation for status_code_published
 *
 * note: this is an old implementation that needs to be updated
 *
 * @param logs - Array of logs to process
 * @returns Array of processed logs with updated field names for status changes
 */
export function mapStatusChangeToLabel(logs: Log[]): Log[] {
  return logs.map((log) => {
    if (isPublishedStatusChange(log)) {
      return addPublishedSuffix(log);
    }
    return log;
  });
}

/**
 * Adds _published to the field name so it can be translated via Weblate
 * @param log Log to add the suffix
 */
function addPublishedSuffix(log: Log): Log {
  return { ...log, field: `${log.field}_published` }; //
}

/**
 * Checks if a log represents a published status change.
 *
 * @param log - The log object to check.
 * @returns true if the log represents a published status change, false otherwise.
 */
function isPublishedStatusChange(log: Log): boolean {
  const isStatusField = log.field.includes("status_code"); // check if the field is a status_code
  const isNotCustomEntity = !log.entity.includes("custom"); // exclude custom highlights status_code changes. Because highlights have also status_code we don't want to display as a status change
  const isReadyStatus = log.new_value === "READY"; // check if the new value of the status_code is "READY"
  return isStatusField && isNotCustomEntity && isReadyStatus;
}

/**
 * Aggregates logs based on a specified field pattern.
 *
 * This function processes an array of log objects, identifies the logs that match the specified field pattern (RegExp),
 * and aggregates them by combining logs with the same entity, action date, and user. It returns a new array of log objects
 * that includes both the aggregated logs and the non-matching logs.
 *
 * @param {Log[]} logs - The array of log objects to process. Each log object should contain at least the properties: entity, action_date, user, and field.
 * @param {RegExp} field - The regular expression pattern used to match the log field for aggregation.
 * @returns {Log[]} - An array of log objects that includes both the aggregated logs matching the field pattern and the original non-matching logs.
 */
export function aggregateLogsByField(logs: Log[], field: RegExp): Array<Log> {
  const { matchedLogs, remainingLogs } = splitLogs(logs, field);

  if (matchedLogs.length === 0) {
    return logs;
  }

  const groupedLogs: { [id: string]: Log } = {};

  matchedLogs.forEach((log) => {
    const { action_date, user, entity } = log;
    const id = `${entity}_${action_date}_${user}`;

    if (!groupedLogs[id]) {
      groupedLogs[id] = {
        ...log,
        action: "updated",
        field: field.source,
      };
    }
  });

  const groupedLogsArray: Log[] = Object.values(groupedLogs);
  const newLogs: Array<Log> = remainingLogs.concat(groupedLogsArray);

  return newLogs;
}

/**
 * Splits the logs into two different arrays based on a specified condition.
 *
 * @param logArray - An array of logs to be split. Each log is expected to have a property `field` which will be tested against the regex.
 * @param regex - A regular expression used to determine if a log matches the specified condition.
 *
 * @returns An object containing two arrays:
 *   - matchedLogs: An array of logs that matched the specified condition based on the regex.
 *   - remainingLogs: An array of logs that did not match the specified condition based on the regex.
 */
function splitLogs(logArray: Log[], regex: RegExp): { matchedLogs: Log[]; remainingLogs: Log[] } {
  const matchedLogs: Log[] = [];
  const remainingLogs: Log[] = [];

  logArray.forEach((log) => {
    regex.test(log.field) ? matchedLogs.push(log) : remainingLogs.push(log);
  });

  return { matchedLogs, remainingLogs };
}

/**
 * Groups additional service extra info logs based on hierarchical group codes and cleans up unnecessary logs.
 *
 * @param {Log[]} logs - The array of log objects to process.
 * @returns {Log[]} - The processed array of log objects, with grouped additional service extra info logs and cleaned up unnecessary logs.
 */
export function groupAdditionalServiceExtraInfo(logs: Log[]) {
  // the hierarchical_group_code is the same of the FunctionalGroupCode
  // is the one we are using to group additional services in fields in the form (eg. Promotional Options, Product brand, Features etc..)
  const regex = /^\/additional_service_extra_info\/[^/]+\/hierarchical_group_code$/;
  const { matchedLogs, remainingLogs } = splitLogs(logs, regex);

  if (!matchedLogs) {
    return logs;
  }

  // we are creating our own logs to understand when an additional services field was updated
  const groupedLogs: { [id: string]: Log } = {};
  matchedLogs.forEach((log) => {
    const FGCode = log.action === "created" ? log.new_value : log.old_value;

    if (!FunctionalGroupCodeSchema.safeParse(FGCode).success) {
      // eslint-disable-next-line no-console
      console.warn(`the hierarchical_group_code '${FGCode}' is not used for any field in nova`);
      return;
    }
    const { action_date, user } = log;
    // if multiple logs share the same functionalCode, timestamp and user it means that is only one update to one field
    const id = `${FGCode}_${action_date}_${user}`;
    if (!groupedLogs[id]) {
      groupedLogs[id] = { ...log, action: "updated", field: FGCode };
    }
  });

  // removing all the additional_service useless logs since we are tracking unused logs to debug purposes
  const regexToRemove = /additional_service_extra_info/;
  const cleanedRemainingLogs = remainingLogs.filter((log) => !regexToRemove.test(log.field));

  return cleanedRemainingLogs.concat(Object.values(groupedLogs));
}
