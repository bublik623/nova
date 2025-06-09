import { DateRange } from "@/types/DateTypes";
import { format, parse } from "date-fns";

/**
 * Get the date range from the date from and date to strings
 */
export function getDateRange(
  dateFrom: string | undefined,
  dateTo: string | undefined,
  dateFormat: string = "dd-MM-yyyy"
): DateRange {
  if (!dateFrom || !dateTo) {
    return { from: undefined, to: undefined };
  }
  return {
    from: parse(dateFrom, dateFormat, new Date()),
    to: parse(dateTo, dateFormat, new Date()),
  };
}

/**
 * Format the date to the format dd-MM-yyyy
 */
export function formatDateToString(date: Date): string {
  return format(date, "dd-MM-yyyy");
}

/**
 * Format the date range to the format: dd/MM/yyyy - dd/MM/yyyy
 */
export function formatDateRangeLabel(dateFrom: Date | undefined, dateTo: Date | undefined): string {
  if (!dateFrom || !dateTo) {
    return "";
  }
  return `${format(dateFrom, "dd/MM/yyyy")} - ${format(dateTo, "dd/MM/yyyy")}`;
}

/**
 * Fix the pricing date to the format YYYY-MM-DD to DD-MM-YYYY
 *
 * this is a workaround and will be removed.
 * https://jira.tuigroup.com/browse/OFF-4643
 */
export function fixPricingDate(date: string) {
  return format(parse(date, "yyyy-MM-dd", new Date()), "dd-MM-yyyy");
}

export function formatDateForApi(date: string) {
  return format(parse(date, "dd-MM-yyyy", new Date()), "yyyy-MM-dd");
}
