import { isoDuration } from "@musement/iso-duration";

/**
 * Convert a duration to his value expressed in seconds
 * @param duration ISO 8601 duration
 * @returns the duration express in seconds
 */
export function convertDurationToSeconds(duration: string) {
  const durationObj = isoDuration(duration).parse();
  let seconds = 0;
  seconds += durationObj.seconds;
  seconds += durationObj.minutes * 60;
  seconds += durationObj.hours * 3600;
  seconds += durationObj.days * 86400;

  return seconds;
}

export function convertDurationToHours(duration: string) {
  return convertDurationToSeconds(duration) / 60 / 60;
}

export function convertHoursToDuration(hours: number) {
  return isoDuration({ hours }).toString();
}
