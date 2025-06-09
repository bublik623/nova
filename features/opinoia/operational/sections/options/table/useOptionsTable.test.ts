import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, Ref, readonly } from "vue";
import { useOptionsTable } from "./useOptionsTable";
import type { Option } from "../types";
import { cloneDeep } from "lodash";

// --- Mock Dependencies ---

// 1. Mock useSortedOptions
const mockSortBy = vi.fn();
const mockSortColumnRef = readonly(ref<string>("title"));
const mockSortDirectionRef = readonly(ref<string>("asc"));

vi.mock("./useSortedOptions", () => ({
  useSortedOptions: vi.fn(() => ({
    sortBy: mockSortBy,
    sortColumn: mockSortColumnRef,
    sortDirection: mockSortDirectionRef,
  })),
}));
import { useSortedOptions as useSortedOptionsMocked } from "./useSortedOptions";
const mockedUseSortedOptions = vi.mocked(useSortedOptionsMocked);

// 2. Mock uuid utility
vi.mock("../../../../../../utils/uuid", () => ({
  uuid: vi.fn(),
}));
import { uuid as localUuid } from "../../../../../../utils/uuid";
const mockLocalUuid = vi.mocked(localUuid);

// --- Test Data Setup ---
const createMockOption = (id: string, title: string, code: string): Option => ({
  id,
  title,
  code,
  duration: 60,
  subchannels: ["WEB"],
  paxTypes: ["ADT"],
});

// --- Test Suite ---
describe("useOptionsTable", () => {
  let optionsRef: Ref<Option[]>;
  let lastSavedOptionsRef: Ref<Option[]>;

  beforeEach(() => {
    // Reset mocks
    mockLocalUuid.mockClear();
    mockSortBy.mockClear();
    mockedUseSortedOptions.mockClear();

    // Reset mock UUID implementation
    let uuidCounter = 0;
    mockLocalUuid.mockImplementation(() => `local-mock-${++uuidCounter}`);

    // Initialize source data using original setup
    optionsRef = ref([
      createMockOption("server-id-1", "Beta Option", "CODEB"),
      createMockOption("server-id-2", "Alpha Option", "CODEA"),
      createMockOption("server-id-3", "Gamma Option", ""),
      createMockOption("local-existing-1", "Delta Option", "CODED"),
      createMockOption("local-existing-2", "Epsilon Option", ""),
    ]);

    // Default to matching the initial state, tests can override if needed
    lastSavedOptionsRef = ref(cloneDeep(optionsRef.value));
  });

  // --- Interaction Tests ---

  it("should call useSortedOptions with the source options ref", () => {
    useOptionsTable(optionsRef, lastSavedOptionsRef);
    expect(mockedUseSortedOptions).toHaveBeenCalledTimes(1);
    expect(mockedUseSortedOptions).toHaveBeenCalledWith(optionsRef);
  });

  it("should return the sort state and functions from useSortedOptions", () => {
    const { sortColumn, sortDirection, sortBy } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    expect(sortColumn).toBe(mockSortColumnRef);
    expect(sortDirection).toBe(mockSortDirectionRef);
    expect(sortBy).toBe(mockSortBy);
  });

  // --- Action Tests ---

  it("addNewOption should add a new option with a generated local id and specific fields", () => {
    const { addNewOption } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    const initialLength = optionsRef.value.length;

    addNewOption();

    expect(optionsRef.value.length).toBe(initialLength + 1);
    const newOption = optionsRef.value[initialLength]; // New option is pushed to the end
    expect(newOption).toEqual({
      id: "local-mock-1", // Expect the mocked local format
      title: "",
      code: "",
      duration: undefined,
      subchannels: "all",
      paxTypes: "all",
    });
    expect(mockLocalUuid).toHaveBeenCalledTimes(1);
  });

  it("removeOption should remove the specified option", () => {
    const { removeOption } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    const optionToRemove = optionsRef.value[1]; // Remove 'Alpha Option' (server-id-2)
    const initialLength = optionsRef.value.length;

    expect(optionsRef.value.find((o) => o.id === "server-id-2")).toBeDefined();
    removeOption(optionToRemove);

    expect(optionsRef.value.length).toBe(initialLength - 1);
    expect(optionsRef.value.find((o) => o.id === "server-id-2")).toBeUndefined();
  });

  it("removeOption should do nothing if option not found", () => {
    const { removeOption } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    const nonExistentOption = { id: "non-existent-id" };
    const initialLength = optionsRef.value.length;
    const initialOptions = cloneDeep(optionsRef.value); // Deep clone for comparison

    removeOption(nonExistentOption);

    expect(optionsRef.value.length).toBe(initialLength);
    expect(optionsRef.value).toEqual(initialOptions); // Ensure array hasn't changed
  });

  it("duplicateOption should insert a copy with a new generated local id", () => {
    const { duplicateOption } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    const optionToDuplicate = optionsRef.value[0]; // Duplicate 'Beta Option' (server-id-1)
    const originalIndex = optionsRef.value.findIndex((o) => o.id === "server-id-1");
    const initialLength = optionsRef.value.length;

    duplicateOption(optionToDuplicate);

    expect(optionsRef.value.length).toBe(initialLength + 1);
    expect(mockLocalUuid).toHaveBeenCalledTimes(1); // Check the *local* mock

    const duplicatedOption = optionsRef.value[originalIndex + 1]; // Item after original
    expect(duplicatedOption.id).toBe("local-mock-1"); // New ID has local format
    expect(duplicatedOption.title).toBe(optionToDuplicate.title);
    expect(duplicatedOption.code).toBe(optionToDuplicate.code);
    expect(duplicatedOption.duration).toBe(optionToDuplicate.duration);
    expect(duplicatedOption.subchannels).toEqual(optionToDuplicate.subchannels);
    expect(duplicatedOption.paxTypes).toEqual(optionToDuplicate.paxTypes);
    // Ensure it's a deep copy (arrays should be different instances)
    expect(duplicatedOption.subchannels).not.toBe(optionToDuplicate.subchannels);
    expect(duplicatedOption.paxTypes).not.toBe(optionToDuplicate.paxTypes);
    // Check original option is still there
    expect(optionsRef.value[originalIndex]).toBe(optionToDuplicate);
  });

  it("duplicateOption should handle duplicating the last item", () => {
    const { duplicateOption } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    const lastIndex = optionsRef.value.length - 1;
    const optionToDuplicate = optionsRef.value[lastIndex]; // Duplicate last item
    const initialLength = optionsRef.value.length;

    duplicateOption(optionToDuplicate);

    expect(optionsRef.value.length).toBe(initialLength + 1);
    expect(mockLocalUuid).toHaveBeenCalledTimes(1);
    const duplicatedOption = optionsRef.value[lastIndex + 1]; // New last item
    expect(duplicatedOption.id).toBe("local-mock-1");
    expect(duplicatedOption.title).toBe(optionToDuplicate.title);
  });

  // --- canEditOptionsCode Tests ---

  it("canEditOptionsCode should return true when the option is not yet saved", () => {
    const { canEditOptionsCode } = useOptionsTable(optionsRef, lastSavedOptionsRef);
    const localWithCode = optionsRef.value.find((o) => o.id === "local-existing-1")!;
    const localWithEmptyCode = optionsRef.value.find((o) => o.id === "local-existing-2")!;
    const newLocalOption = { id: "local-12345", title: "New", code: "HAS_CODE" } as Option;

    expect(canEditOptionsCode(localWithCode)).toBe(true);
    expect(canEditOptionsCode(localWithEmptyCode)).toBe(true);
    expect(canEditOptionsCode(newLocalOption)).toBe(true);
  });

  it("canEditOptionsCode should return true when the option has been saved without code", () => {
    lastSavedOptionsRef.value = [
      createMockOption("server-id-1", "Beta Option", "CODEB"), // Saved with code
      // server-id-2 (Alpha) is missing from saved list
      createMockOption("server-id-3", "Gamma Option", ""), // Saved with empty code
    ];

    const { canEditOptionsCode } = useOptionsTable(optionsRef, lastSavedOptionsRef);

    // Case A: Saved version explicitly has empty code (Gamma, server-id-3)
    // The current code in optionsRef doesn't influence the result here.
    const optionSavedWithEmptyCode = optionsRef.value.find((o) => o.id === "server-id-3")!;
    expect(canEditOptionsCode(optionSavedWithEmptyCode)).toBe(true);

    // Case B: No saved version exists in our mock (Alpha, server-id-2)
    // This also results in true because !lastSavedVersion is true
    const optionNotYetSavedToServer = optionsRef.value.find((o) => o.id === "server-id-2")!;
    expect(canEditOptionsCode(optionNotYetSavedToServer)).toBe(true);
  });

  it("canEditOptionsCode should return false when the option has been saved with a code", () => {
    lastSavedOptionsRef.value = [
      createMockOption("server-id-1", "Beta Option", "CODEB"), // Saved with code
      createMockOption("server-id-2", "Alpha Option", "CODEA"), // Saved with code
      createMockOption("server-id-3", "Gamma Option", ""), // Saved with empty code
    ];
    // Call composable AFTER setting up specific refs for this test
    const { canEditOptionsCode } = useOptionsTable(optionsRef, lastSavedOptionsRef);

    // Get items that were saved with non-empty codes
    const serverWithCode1 = optionsRef.value.find((o) => o.id === "server-id-1")!;
    const serverWithCode2 = optionsRef.value.find((o) => o.id === "server-id-2")!;

    // Expected false because ID is not local- AND last saved code was not empty
    expect(canEditOptionsCode(serverWithCode1)).toBe(false);
    expect(canEditOptionsCode(serverWithCode2)).toBe(false);
  });
});
