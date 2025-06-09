import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, Ref } from "vue";
import { useSavedExperiencePaxTypes } from "./useSavedExperiencePaxTypes";
import { useGetExperiencePaxesQuery } from "@/features/experience-raw/api/useExperiencePaxesQuery";
import { useGetPaxQuery } from "@/features/masterdata/api/useMasterdataQuery";
import { Pax } from "@/types/generated/ExperienceMasterDataApi"; // Assuming path
// Assuming ExperiencePaxType is defined somewhere, create a mock structure
type MockExperiencePaxType = { pax_code: string /* other fields if needed */ };

// Mock the TanStack Query hooks
vi.mock("@/features/experience-raw/api/useExperiencePaxesQuery");
vi.mock("@/features/masterdata/api/useMasterdataQuery");

// Define mock return types matching TanStack Query's structure (simplified)
type MockQueryResult<T> = {
  data: Ref<T | undefined>;
  // Add isLoading, isError etc. refs if you need to test those states
};

describe("useSavedExperiencePaxTypes", () => {
  // Define mock data structures based on inferred types
  const mockMasterDataPaxes: Pax[] = [
    { id: "PAX-1", name: "ADT", type: "PERSON", language_code: "en", description: "Adult" },
    { id: "PAX-2", name: "CHD", type: "PERSON", language_code: "es", description: "Child" },
    { id: "PAX-3", name: "INF", type: "PERSON", language_code: "en", description: "Infant" },
  ];

  const mockExperiencePaxes: MockExperiencePaxType[] = [
    { pax_code: "ADT" },
    { pax_code: "CHD" },
    { pax_code: "UNKNOWN_PAX" }, // Test case for missing master data
  ];

  // Mocks for the query hooks
  const mockUseGetPaxQuery = vi.mocked(useGetPaxQuery);
  const mockUseGetExperiencePaxesQuery = vi.mocked(useGetExperiencePaxesQuery);

  let mockMasterDataRef: Ref<Pax[] | undefined>;
  let mockExperiencePaxRef: Ref<MockExperiencePaxType[] | undefined>;
  let experienceId: Ref<string>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup default mock refs
    mockMasterDataRef = ref(mockMasterDataPaxes);
    mockExperiencePaxRef = ref(mockExperiencePaxes);
    experienceId = ref("exp1");

    // Mock implementations for the hooks
    mockUseGetPaxQuery.mockReturnValue({
      data: mockMasterDataRef,
      // Mock other query states like isLoading: ref(false) if needed
    } as MockQueryResult<Pax[]>); // Cast to simplified type

    mockUseGetExperiencePaxesQuery.mockReturnValue({
      data: mockExperiencePaxRef,
      // Mock other query states like isLoading: ref(false) if needed
    } as MockQueryResult<MockExperiencePaxType[]>); // Cast to simplified type
  });

  it("should return a computed list of saved pax types with names from master data", () => {
    const resultComputed = useSavedExperiencePaxTypes(experienceId);

    expect(resultComputed.value).toEqual([
      { code: "ADT", name: "Adult" },
      { code: "CHD", name: "Child" },
      { code: "UNKNOWN_PAX", name: "unknown" }, // Handled missing master data
    ]);
  });

  it("should call the query hooks with the correct parameters", () => {
    useSavedExperiencePaxTypes(experienceId);

    // Check master data query call
    expect(mockUseGetPaxQuery).toHaveBeenCalledTimes(1);
    // Check the argument passed to useGetPaxQuery (should be a ref containing "PERSON")
    const paxQueryArg = mockUseGetPaxQuery.mock.calls[0][0] as Ref<string>;
    expect(paxQueryArg.value).toBe("PERSON");

    // Check experience paxes query call
    expect(mockUseGetExperiencePaxesQuery).toHaveBeenCalledTimes(1);
    expect(mockUseGetExperiencePaxesQuery).toHaveBeenCalledWith(experienceId);
  });

  it("should return an empty array if experience paxes data is undefined", () => {
    mockExperiencePaxRef.value = undefined; // Simulate loading or error state
    const resultComputed = useSavedExperiencePaxTypes(experienceId);
    expect(resultComputed.value).toEqual([]);
  });

  it("should return an empty array if experience paxes data is empty", () => {
    mockExperiencePaxRef.value = [];
    const resultComputed = useSavedExperiencePaxTypes(experienceId);
    expect(resultComputed.value).toEqual([]);
  });

  it('should return pax types with "unknown" name if master data is undefined', () => {
    mockMasterDataRef.value = undefined; // Simulate loading or error state
    const resultComputed = useSavedExperiencePaxTypes(experienceId);
    expect(resultComputed.value).toEqual([
      { code: "ADT", name: "unknown" },
      { code: "CHD", name: "unknown" },
      { code: "UNKNOWN_PAX", name: "unknown" },
    ]);
  });

  it('should return pax types with "unknown" name if master data is empty', () => {
    mockMasterDataRef.value = [];
    const resultComputed = useSavedExperiencePaxTypes(experienceId);
    expect(resultComputed.value).toEqual([
      { code: "ADT", name: "unknown" },
      { code: "CHD", name: "unknown" },
      { code: "UNKNOWN_PAX", name: "unknown" },
    ]);
  });

  it("should react to changes in experienceId", () => {
    useSavedExperiencePaxTypes(experienceId);
    expect(mockUseGetExperiencePaxesQuery).toHaveBeenCalledWith(experienceId);

    // Change the experience ID
    experienceId.value = "exp2";
    // TanStack Query's Vue integration should re-trigger the query hook.
    // We re-call the composable in the test context to simulate component re-render/setup.
    // Note: In a real component, reactivity handles this. Here, we simulate the effect.
    useSavedExperiencePaxTypes(experienceId);

    // Expect it to have been called again, now potentially with the new ID.
    // Depending on TanStack's internal caching and how the reference is handled,
    // the exact calls might vary. The key is that the hook *receives* the reactive ref.
    // Let's check it was called more than once (initial + after change simulation)
    expect(mockUseGetExperiencePaxesQuery.mock.calls.length).toBeGreaterThanOrEqual(2);
    // Check the argument of the latest call
    expect(mockUseGetExperiencePaxesQuery.mock.calls[mockUseGetExperiencePaxesQuery.mock.calls.length - 1][0]).toBe(
      experienceId
    );
  });

  it("should react to changes in query data", async () => {
    const resultComputed = useSavedExperiencePaxTypes(experienceId);

    // Initial state
    expect(resultComputed.value).toHaveLength(3);

    // Simulate master data updating
    mockMasterDataRef.value = [
      { id: "PAX-1", name: "ADT", type: "PERSON", language_code: "en", description: "Adult Updated" },
      { id: "PAX-2", name: "CHD", type: "PERSON", language_code: "es", description: "Child Updated" },
      // INF is missing in experience paxes, should not appear
      { id: "PAX-NEW", name: "NEW", type: "PERSON", language_code: "en", description: "New Pax" }, // NEW is missing in experience paxes, should not appear
    ];
    await nextTick(); // Allow computed property to update

    expect(resultComputed.value).toEqual([
      { code: "ADT", name: "Adult Updated" },
      { code: "CHD", name: "Child Updated" },
      { code: "UNKNOWN_PAX", name: "unknown" }, // Still unknown as it's not in the new master data
    ]);

    // Simulate experience paxes updating
    mockExperiencePaxRef.value = [
      { pax_code: "ADT" },
      { pax_code: "NEW" }, // Add NEW pax type
    ];
    await nextTick(); // Allow computed property to update

    expect(resultComputed.value).toEqual([
      { code: "ADT", name: "Adult Updated" },
      { code: "NEW", name: "New Pax" },
    ]);
  });
});
