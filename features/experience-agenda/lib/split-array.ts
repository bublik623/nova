/**
 * Splits an array into subarrays of up to a specified length.
 * @param array - The array to split.
 * @param maxLength - The maximum length of each subarray.
 * @returns An array of subarrays, where each subarray contains up to maxLength items from the original array.
 */
export function splitArray<T>(array: Array<T>, maxLength: number) {
  const result = [];
  for (let i = 0; i < array.length; i += maxLength) {
    result.push(array.slice(i, i + maxLength));
  }

  return result;
}
