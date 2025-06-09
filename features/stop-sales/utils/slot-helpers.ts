import { format } from "date-fns";

/**
 * Formats a date to a string like "Mon, 1"
 * @param date - The date to format
 * @returns The formatted date
 */
export function formatDay(date: string) {
  try {
    return format(new Date(date), "EEE, d");
  } catch (error) {
    return "invalid date";
  }
}
