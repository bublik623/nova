import { TimeUnit } from "@/types/TimeUnit";

/**
 * Parses a time string and returns an object with hour, minutes, and seconds properties.
 *
 * @param time The time string to parse. Can be in the format "hh:mm:ss"
 * @example parseStringTime("12:34:00"); // { hour: 12, minutes: 34, seconds: 00 }
 */
export function parseStringTime(time: string | undefined) {
  if (!time) {
    return { hour: undefined, minutes: undefined, seconds: undefined };
  }
  const splittedString = time.split(":");
  const hour = parseInt(splittedString[0]) || 0;
  const minutes = parseInt(splittedString[1]) || 0;
  const seconds = parseInt(splittedString[2]) || 0;
  return { hour, minutes, seconds };
}
/**
 * Update a time string.
 *
 * @param time The time string to update. Can be in the format "hh:mm:ss"
 * @param unit The unit time to update."
 * @param value The new value you want to set."
 * @returns a new time string in format "hh:mm:ss"
 * @example updateStringTime("12:34:00", TimeUnit.hour, 2); // "14:34:00"
 */
export function updateStringTime(time: string | undefined, unit: TimeUnit, value: number) {
  if (!time) {
    return undefined;
  }
  const splittedString = time.split(":");

  return splittedString.map((el, id) => (id === unit ? value.toString().padStart(2, "0") : el)).join(":");
}
