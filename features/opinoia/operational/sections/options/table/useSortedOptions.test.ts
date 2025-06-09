import { describe, it, expect, beforeEach } from "vitest";
import { ref, type Ref } from "vue";
import { useSortedOptions } from "./useSortedOptions";
import type { Option } from "../types";

const optionA: Option = { id: "1", code: "AAA", title: "Apple", subchannels: [], paxTypes: [] };
const optionB: Option = { id: "2", code: "CCC", title: "Banana", subchannels: [], paxTypes: [] };
const optionC: Option = { id: "3", code: "BBB", title: "Cherry", subchannels: [], paxTypes: [] };
const optionD_emptyTitle: Option = { id: "4", code: "DDD", title: "", subchannels: [], paxTypes: [] };
const optionE_emptyCode: Option = { id: "5", code: "", title: "Elderberry", subchannels: [], paxTypes: [] };

// Helper to get IDs for easier comparison
const getIds = (options: Option[]) => options.map((o) => o.id);

describe("useSortedOptions", () => {
  let sourceOptions: Ref<Option[]>;
  let composable: ReturnType<typeof useSortedOptions>;

  beforeEach(() => {
    // Initialize with fresh, UNSORTED data for most tests
    sourceOptions = ref<Option[]>([{ ...optionC }, { ...optionA }, { ...optionB }]);
    composable = useSortedOptions(sourceOptions);
  });

  describe("Initialization", () => {
    it('should initialize with sortColumn set to "title"', () => {
      expect(composable.sortColumn.value).toBe("title");
    });

    it('should initialize with sortDirection set to "asc"', () => {
      expect(composable.sortDirection.value).toBe("asc");
    });

    it("should sort the source options array by title ascending immediately upon initialization", () => {
      expect(getIds(sourceOptions.value)).toEqual(["1", "2", "3"]);
      expect(sourceOptions.value).toEqual([optionA, optionB, optionC]);
    });
  });

  describe("sortBy function", () => {
    it("should change sort column, reset direction, and sort source array", () => {
      expect(getIds(sourceOptions.value)).toEqual(["1", "2", "3"]);

      composable.sortBy("code");

      expect(composable.sortColumn.value).toBe("code");
      expect(composable.sortDirection.value).toBe("asc");

      expect(getIds(sourceOptions.value)).toEqual(["1", "3", "2"]);
      expect(sourceOptions.value).toEqual([optionA, optionC, optionB]);
    });

    it("should toggle sort direction and sort source array", () => {
      expect(getIds(sourceOptions.value)).toEqual(["1", "2", "3"]);

      // First call -> title/desc
      composable.sortBy("title");
      expect(composable.sortDirection.value).toBe("desc");
      expect(getIds(sourceOptions.value)).toEqual(["3", "2", "1"]);

      // Second call -> title/asc
      composable.sortBy("title");
      expect(composable.sortDirection.value).toBe("asc");
      expect(getIds(sourceOptions.value)).toEqual(["1", "2", "3"]);
    });
  });

  describe("Sorting Results (In-Place on source array)", () => {
    it("should sort by code ascending when specified", () => {
      composable.sortBy("code");
      expect(getIds(sourceOptions.value)).toEqual(["1", "3", "2"]);
      expect(sourceOptions.value).toEqual([optionA, optionC, optionB]);
    });

    it("should sort by code descending when specified", () => {
      composable.sortBy("code"); // Sorts code/asc
      composable.sortBy("code"); // Toggles code/desc
      expect(getIds(sourceOptions.value)).toEqual(["2", "3", "1"]);
      expect(sourceOptions.value).toEqual([optionB, optionC, optionA]);
    });

    it("should place empty string titles at the end when sorting title/desc", () => {
      sourceOptions.value = [{ ...optionD_emptyTitle }, { ...optionA }, { ...optionB }];

      composable.sortBy("title"); // Toggles to title/desc

      expect(composable.sortDirection.value).toBe("desc");
      expect(getIds(sourceOptions.value)).toEqual(["2", "1", "4"]);
      expect(sourceOptions.value).toEqual([optionB, optionA, optionD_emptyTitle]);
    });

    it("should place empty string titles at the end when sorting title/asc", () => {
      sourceOptions.value = [{ ...optionD_emptyTitle }, { ...optionA }, { ...optionB }];
      composable.sortBy("title"); // Toggles to title/desc

      composable.sortBy("title"); // Toggles back to title/asc

      expect(composable.sortDirection.value).toBe("asc");

      expect(getIds(sourceOptions.value)).toEqual(["1", "2", "4"]);
      expect(sourceOptions.value).toEqual([optionA, optionB, optionD_emptyTitle]);
    });

    it("should place empty string codes at the end when sorting code/asc", () => {
      sourceOptions.value = [{ ...optionE_emptyCode }, { ...optionC }, { ...optionA }];

      composable.sortBy("code"); // sets code/asc

      expect(getIds(sourceOptions.value)).toEqual(["1", "3", "5"]);
      expect(sourceOptions.value).toEqual([optionA, optionC, optionE_emptyCode]);
    });

    it("should place empty string codes at the end when sorting code/desc", () => {
      sourceOptions.value = [{ ...optionE_emptyCode }, { ...optionC }, { ...optionA }];

      composable.sortBy("code"); // sets code/asc

      composable.sortBy("code"); // toggles code/desc

      expect(getIds(sourceOptions.value)).toEqual(["3", "1", "5"]);
      expect(sourceOptions.value).toEqual([optionC, optionA, optionE_emptyCode]);
    });
  });
});
