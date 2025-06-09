import { ref, readonly, type Ref } from "vue";
import type { Option } from "../types"; // Assuming Option type is defined here

// Define the types for sorting (can be kept internal or exported if needed)
type SortColumn = keyof Pick<Option, "title" | "code">;
type SortDirection = "asc" | "desc";

interface UseSortedOptionsReturn {
  /**
   * A readonly, reactive reference indicating which column key ('title' or 'code')
   * was most recently used to sort the array.
   *
   * @remarks
   * This ref is updated automatically whenever the `sortBy` function is called.
   * Its value reflects the column criteria applied during the last in-place sort.
   * Primarily intended for UI display (e.g., highlighting the active sort header).
   * Use the `sortBy` function to change the active sort column.
   *
   * @defaultValue 'title'
   */
  sortColumn: Readonly<Ref<SortColumn>>;

  /**
   * A readonly, reactive reference indicating the direction ('asc' or 'desc')
   * applied during the most recent sort operation.
   *
   * @remarks
   * This ref is updated automatically whenever the `sortBy` function is called.
   * The direction toggles if `sortBy` is called with the same column consecutively,
   * otherwise it resets to 'asc' when the column changes.
   * Primarily intended for UI display (e.g., showing sort direction arrows).
   *
   * @defaultValue 'asc'
   */
  sortDirection: Readonly<Ref<SortDirection>>;

  /**
   * **WARNING:** This function directly MUTATES the original `options` array
   * passed to the `useSortedOptions` composable by sorting it in-place.
   *
   * Updates the internal `sortColumn` and `sortDirection` state based on the
   * provided `column` (toggling direction if the column is unchanged, resetting
   * to 'asc' otherwise), and then immediately performs an in-place sort
   * on the `options.value` array using these updated criteria.
   *
   * @param column - The key of the property ('title' or 'code') within the Option
   * objects to use for the comparison during the in-place sort.
   * @returns {void} This function does not return a value.
   */
  sortBy: (column: SortColumn) => void;
}

// Helper function to check for empty values (null, undefined, '')
function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === "";
}

/**
 * **WARNING:** This composable MUTATES the input `options` array by sorting it in-place.
 *
 * Provides state for tracking sort column/direction and a function to trigger
 * an in-place sort on the provided reactive array reference. Use with caution,
 * especially if the options array is shared or passed down as a prop.
 *
 * @param options - A Ref containing the array of items to be sorted **in-place**.
 * @returns An object containing reactive sort state and the sorting function.
 */
export function useSortedOptions(options: Ref<Option[]>): UseSortedOptionsReturn {
  const sortColumn = ref<SortColumn>("title");
  const sortDirection = ref<SortDirection>("asc");

  function applySort() {
    if (!options.value || !Array.isArray(options.value)) {
      return;
    }

    const currentColumn = sortColumn.value;
    const directionMultiplier = sortDirection.value === "asc" ? 1 : -1;

    options.value.sort((a, b) => {
      const valA = a[currentColumn];
      const valB = b[currentColumn];

      const aIsEmpty = isEmpty(valA);
      const bIsEmpty = isEmpty(valB);

      // Empty strings go last
      if (aIsEmpty && !bIsEmpty) return 1;
      if (!aIsEmpty && bIsEmpty) return -1;
      if (aIsEmpty && bIsEmpty) return 0;

      // Compare non-empty string values
      let comparison = String(valA).localeCompare(String(valB));

      return comparison * directionMultiplier;
    });
  }

  function sortBy(column: SortColumn) {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
      sortColumn.value = column;
      sortDirection.value = "asc";
    }

    applySort();
  }

  // Perform initial sort when the composable is setup
  applySort();

  return {
    sortColumn: readonly(sortColumn),
    sortDirection: readonly(sortDirection),
    sortBy,
  };
}
