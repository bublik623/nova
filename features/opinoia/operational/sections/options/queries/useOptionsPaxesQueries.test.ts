import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ref, type Ref } from "vue";
import { useQueries } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi"; // Ensure path is correct
import { useOptionsPaxesQueries } from "./useOptionsPaxesQueries"; // Ensure path is correct
import type { AxiosResponse } from "axios";
import type { OptionPaxes } from "@/types/generated/OfferServiceApi"; // Ensure path is correct

// --- Mock Dependencies ---
vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: vi.fn(() => ({
    getOptionPaxes: vi.fn(), // Mock the specific API function needed
  })),
}));

vi.mock("@tanstack/vue-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/vue-query")>();
  return {
    ...actual,
    useQueries: vi.fn(), // Mock useQueries
  };
});

// --- BDD Tests Start ---

describe("useOptionsPaxesQueries Composable Behavior", () => {
  // Context variables
  let optionsId: Ref<string[]>;
  const mockGetOptionPaxes = vi.fn();
  const mockUseQueries = useQueries as Mock;
  const mockUseOfferServiceApi = useOfferServiceApi as Mock;

  // Helper to get the computed queries array passed to useQueries
  const getQueriesArg = () => {
    if (mockUseQueries.mock.calls.length === 0) {
      throw new Error("useQueries was not called");
    }
    // useQueries is called with an object: { queries: computedRef }
    // We need the computed ref's value
    const computedQueriesRef = mockUseQueries.mock.calls[0][0].queries;
    return computedQueriesRef.value; // Access the array value inside the computed ref
  };

  beforeEach(() => {
    // GIVEN: Reset state before each scenario
    vi.clearAllMocks();
    optionsId = ref([]); // Start with empty IDs

    mockUseOfferServiceApi.mockReturnValue({
      getOptionPaxes: mockGetOptionPaxes,
    });

    // Provide a default mock return value for useQueries
    mockUseQueries.mockReturnValue(ref([])); // Represents the array of query results
  });

  // Scenario: Generating Query Definitions
  describe("Query Definition Generation", () => {
    it("should pass an empty query list to useQueries when optionsId is initially empty", () => {
      // GIVEN: optionsId is empty (from beforeEach)

      // WHEN: The composable is initialized
      useOptionsPaxesQueries(optionsId);

      // THEN: useQueries should be called
      expect(mockUseQueries).toHaveBeenCalledTimes(1);
      // THEN: The computed 'queries' array passed to useQueries should be empty
      expect(getQueriesArg()).toEqual([]);
    });

    it("should generate a query definition for each ID present in optionsId", () => {
      // GIVEN: optionsId has multiple IDs
      optionsId.value = ["opt_1", "opt_2", "opt_3"];

      // WHEN: The composable is initialized
      useOptionsPaxesQueries(optionsId);

      // THEN: useQueries should be called
      expect(mockUseQueries).toHaveBeenCalledTimes(1);
      // THEN: The computed 'queries' array should have the same length as optionsId
      expect(getQueriesArg()).toHaveLength(3);
    });

    it('should structure each queryKey correctly as ["option-paxes", optionId]', () => {
      // GIVEN: optionsId has specific IDs
      const id1 = "pax_abc";
      const id2 = "pax_xyz";
      optionsId.value = [id1, id2];

      // WHEN: The composable is initialized
      useOptionsPaxesQueries(optionsId);

      // THEN: The query keys in the generated definitions should be correct
      const queries = getQueriesArg();
      expect(queries[0].queryKey).toEqual(["option-paxes", id1]);
      expect(queries[1].queryKey).toEqual(["option-paxes", id2]);
    });

    it("should set queryFn to call getOptionPaxes with the correct ID for each definition", async () => {
      // GIVEN: optionsId has specific IDs
      const id1 = "pax_fn_1";
      const id2 = "pax_fn_2";
      optionsId.value = [id1, id2];
      // GIVEN: Mock the API response (can be simple)
      mockGetOptionPaxes.mockResolvedValue({ data: {} });

      // WHEN: The composable is initialized
      useOptionsPaxesQueries(optionsId);

      // THEN: Simulate execution of each queryFn
      const queries = getQueriesArg();
      await queries[0].queryFn(); // Execute the first queryFn
      await queries[1].queryFn(); // Execute the second queryFn

      // THEN: Verify getOptionPaxes was called correctly for each ID
      expect(mockGetOptionPaxes).toHaveBeenCalledWith(id1);
      expect(mockGetOptionPaxes).toHaveBeenCalledWith(id2);
      expect(mockGetOptionPaxes).toHaveBeenCalledTimes(2);
    });

    it("should set select to transform the response and include the corresponding optionId", async () => {
      // GIVEN: optionsId has specific IDs
      const id1 = "pax_select_1";
      const id2 = "pax_select_2";
      optionsId.value = [id1, id2];

      // GIVEN: Define mock API responses for each ID
      const responseData1: OptionPaxes = { pax_list: [{ pax_code: "data for pax_select_1" }] };
      const responseData2: OptionPaxes = { pax_list: [{ pax_code: "data for pax_select_2" }] };
      // Simulate the AxiosResponse structure
      const mockAxiosResponse1: AxiosResponse<OptionPaxes> = {
        data: responseData1,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };
      const mockAxiosResponse2: AxiosResponse<OptionPaxes> = {
        data: responseData2,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };

      // GIVEN: Configure mockGetOptionPaxes to return different data based on ID
      mockGetOptionPaxes
        .mockResolvedValueOnce(mockAxiosResponse1) // First call resolves with response 1
        .mockResolvedValueOnce(mockAxiosResponse2); // Second call resolves with response 2

      // WHEN: The composable is initialized
      useOptionsPaxesQueries(optionsId);

      // WHEN: Simulate queryFn execution and apply the select function for each query
      const queries = getQueriesArg();
      // Simulate fetching data (needed for select) - we use the mock setup above
      const resultFromQueryFn1 = await queries[0].queryFn();
      const resultFromQueryFn2 = await queries[1].queryFn();
      // Apply select function
      const selectedData1 = queries[0].select(resultFromQueryFn1);
      const selectedData2 = queries[1].select(resultFromQueryFn2);

      // THEN: The selected data should have the correct structure and corresponding optionId
      expect(selectedData1).toEqual({ optionId: id1, optionPaxes: responseData1 });
      expect(selectedData2).toEqual({ optionId: id2, optionPaxes: responseData2 });
    });
  });

  // Scenario: Reactivity to Input Changes
  describe("Reactivity", () => {
    it("should update the query definitions passed to useQueries when optionsId changes", () => {
      // GIVEN: The composable is initialized with one ID
      optionsId.value = ["opt_initial"];
      useOptionsPaxesQueries(optionsId);

      // THEN: Initially, there should be one query definition
      expect(getQueriesArg()).toHaveLength(1);
      expect(getQueriesArg()[0].queryKey).toEqual(["option-paxes", "opt_initial"]);

      // WHEN: optionsId ref is updated with new IDs
      const newId1 = "opt_new_1";
      const newId2 = "opt_new_2";
      optionsId.value = [newId1, newId2]; // Vue reactivity triggers the computed property

      // THEN: The computed 'queries' array passed to useQueries should update
      // Need to wait for Vue's reactivity potentially, though computed should update immediately
      // Note: In reality, useQueries handles this internally based on the computed ref changing.
      // We are checking if our computed function correctly recalculates.
      const updatedQueries = getQueriesArg(); // Re-evaluate the computed property value
      expect(updatedQueries).toHaveLength(2);
      expect(updatedQueries[0].queryKey).toEqual(["option-paxes", newId1]);
      expect(updatedQueries[1].queryKey).toEqual(["option-paxes", newId2]);
    });
  });

  // Scenario: Composable Output
  describe("Composable Return Value", () => {
    it("should return the result provided by the useQueries hook", () => {
      // GIVEN: A specific mocked result from useQueries
      const mockQueryResult = ref([
        // Simulate the structure returned by useQueries (array of refs/results)
        { data: ref({ optionId: "res1", optionPaxes: {} }), isLoading: ref(false) },
        { data: ref({ optionId: "res2", optionPaxes: {} }), isLoading: ref(false) },
      ]);
      mockUseQueries.mockReturnValue(mockQueryResult); // Configure mock return

      // WHEN: The composable is initialized
      const result = useOptionsPaxesQueries(optionsId);

      // THEN: The value returned by our composable should be the exact mocked result
      expect(result).toBe(mockQueryResult);
    });
  });
});
