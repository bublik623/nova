import { ShortDayNames } from "@/types/DateTypes";

/**
 * Adds the specified number of days to the given date.
 * @param date - The date to add days to.
 * @param days - The number of days to add.
 * @example addDays(new Date("2022-01-16"),2) // => new Date("2022-01-18")
 */
export function addDays(date: Date, days: number) {
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Gets the first day of a month
 * @param myDate
 * @returns Date corresponding to the first day of myDate's month
 */
export function startOfMonth(myDate: Date): Date {
  const date = new Date(myDate.getTime());
  date.setDate(1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}

/**
 * Gets the last day of a month
 * @param myDate
 * @returns Date corresponding to the last day of myDate's month
 */
export function endOfMonth(myDate: Date): Date {
  const date = new Date(myDate.getTime());
  date.setMonth(date.getMonth() + 1);
  // setDate(0) will set the date to the last day of previous month
  date.setDate(0);
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return date;
}

/**
 * Compares two dates without considering the time
 * @param firstDate
 * @param secondDate
 * @returns Boolean
 */
export function compareDatesWithoutTime(firstDate: Date, secondDate: Date) {
  const date1 = new Date(firstDate.getTime());
  const date2 = new Date(secondDate.getTime());

  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  return date1.getTime() === date2.getTime();
}

/**
 * Returns an object containing the days(mon,tue,wed) of the week within a given date range.
 *
 * @param dateRange - An array containing two strings representing the start and end dates of the range in the format 'yyyy-MM-dd'.
 * @example getDaysOfWeek(["2022-12-22", "2022-12-24"]) // => { mon:false, tue: false, wed: false, thu: true, fri: true, sat: true, sun: false }
 */
export function getDaysOfWeek(
  startDate: string | Date,
  endDate: string | Date
): {
  [day in ShortDayNames]: boolean;
} {
  const daysOfWeek: Record<ShortDayNames, boolean> = {
    Sun: false, // date.getDay() => zero represents sunday
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
  };

  let date = new Date(startDate);
  while (date <= new Date(endDate)) {
    // If all props in the daysOfWeek object are equal to true, break out of the loop. So that we don't have to check rest of the range.
    if (Object.values(daysOfWeek).every((dayValue) => dayValue === true)) {
      break;
    }
    const dayName = Object.keys(daysOfWeek)[date.getDay()] as keyof typeof daysOfWeek;
    daysOfWeek[dayName] = true;
    date = addDays(date, 1);
  }

  return daysOfWeek;
}

/**
 * Converts a date string in the format 'YYYY-MM-DDTHH:mm:ss.SSSZ' to a string in the format 'YYYY-MM-DD'.
 */
export function formatDate(date: Date): string {
  return [date.getFullYear(), padStart(2, date.getMonth() + 1), padStart(2, date.getDate())].join("-");
}

/**
 * Return an array containing all the dates between two dates
 * @param startDate
 * @param endDate
 */
export function getDates(startDate: Date, endDate: Date) {
  const start = new Date(new Date(startDate).setHours(0, 0, 0, 0));
  const end = new Date(new Date(endDate).setHours(0, 0, 0, 0));

  let date = new Date(start.getTime());
  const dates = [];

  while (date <= end) {
    dates.push(new Date(date));
    date = addDays(date, 1);
  }

  return dates;
}

export function formatDateFromString(date?: string) {
  if (date) {
    return new Intl.DateTimeFormat("en-gb").format(new Date(date));
  } else {
    return "";
  }
}

export function formatDateTimeAsUTCRegardlessOfTimezone(date?: Date): string | undefined {
  return date ? `${formatDate(date)}T${formatTime(date)}Z` : undefined;
}

function padStart(length: number, num: number) {
  return num.toString().padStart(length, "0");
}

function formatTime(date: Date): string {
  return (
    [padStart(2, date.getHours()), padStart(2, date.getMinutes()), padStart(2, date.getSeconds())].join(":") +
    "." +
    padStart(3, date.getMilliseconds())
  );
}
