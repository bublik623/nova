/**
 *
 * @param prefix the prefix to format, can be number, string or undefined
 * @returns the formatted prefix
 * @example
 * formatPrefix(123) // returns "+123"
 * formatPrefix("+123") // returns "+123"
 * formatPrefix("+123") // returns "+123"
 * formatPrefix(undefined) // returns "+00
 * @description This function formats a prefix to be used in a phone number, it adds a "+" if it's not present, and returns a default value if the prefix is undefined
 */
export function formatPrefix(prefix?: number | string | null): string {
  if (prefix == null) {
    return "+00";
  }

  if (typeof prefix === "string" && prefix.startsWith("+")) {
    return prefix;
  }

  return `+${prefix}`;
}
