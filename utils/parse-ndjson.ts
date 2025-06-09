/**
 * Parses the application/x-ndjson response into a JS object
 * @param responseData Data returning from the api call
 * @returns Array of parsed objects
 */
export function parseNDJSON<T>(responseData: string | T): Array<T> {
  if (typeof responseData === "string") {
    const jsonRows = responseData.split(/\n|\n\r/).filter(Boolean);
    return jsonRows.map((jsonStringRow) => JSON.parse(jsonStringRow));
  } else {
    return [responseData];
  }
}
