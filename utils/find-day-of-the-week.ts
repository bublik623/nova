/**
 * Convert a key to the right day of the week.
 *
 * @param key should be a number from 1 to 7; 1 is Monday, 7 is Sunday"
 * @example findDayOfTheWeek(3); // "wednesday"
 */
export function findDayOfTheWeek(key: number) {
  switch (key) {
    case 1:
      return "monday";
    case 2:
      return "tuesday";
    case 3:
      return "wednesday";
    case 4:
      return "thursday";
    case 5:
      return "friday";
    case 6:
      return "saturday";
    case 7:
      return "sunday";
    default:
      throw new Error("The number is not related to any day of the week");
  }
}
