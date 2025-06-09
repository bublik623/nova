import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { ref, computed, type Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useOfferServiceApi } from "@/composables/useOfferServiceApi"; // Ensure the path is correct
import { useOptionsQuery } from "./useOptionsQuery"; // Ensure the path is correct

// --- Mock Dependencies ---
vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: vi.fn(() => ({
    getOptions: vi.fn(),
  })),
}));

vi.mock("@tanstack/vue-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/vue-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// --- BDD Tests Start ---

describe("useOptionsQuery Composable Behavior", () => {
  // Context variables for tests
  let experienceId: Ref<string | undefined>;
  const mockGetOptions = vi.fn();
  const mockUseQuery = useQuery as Mock;
  const mockUseOfferServiceApi = useOfferServiceApi as Mock;

  beforeEach(() => {
    // GIVEN: Reset state before each scenario
    vi.clearAllMocks();
    experienceId = ref<string | undefined>(undefined);

    mockUseOfferServiceApi.mockReturnValue({
      getOptions: mockGetOptions,
    });

    mockUseQuery.mockReturnValue({
      // Basic simulated return value
      data: ref(null),
      isLoading: ref(false),
      isError: ref(false),
      error: ref(null),
    });
  });

  // Scenario: Initial Query Configuration
  describe("Query Configuration", () => {
    it('should configure the query with a key containing "options" and the experience ID ref', () => {
      // GIVEN: experienceId ref (set in beforeEach)

      // WHEN: The composable is initialized
      useOptionsQuery(experienceId);

      // THEN: useQuery should be called with the correct query key structure
      expect(mockUseQuery).toHaveBeenCalled();
      const queryOptions = mockUseQuery.mock.calls[0][0];
      expect(queryOptions.queryKey).toEqual(["options", experienceId]);
    });
  });

  // Scenario: Query Enabling Logic based on Experience ID
  describe("Query Enabling Logic", () => {
    it("should disable the query when the experience ID is initially undefined", () => {
      // GIVEN: experienceId is undefined (default from beforeEach)

      // WHEN: The composable is initialized
      useOptionsQuery(experienceId);

      // THEN: The query's enabled status should be false
      const queryOptions = mockUseQuery.mock.calls[0][0];
      const enabledValue = computed(() => queryOptions.enabled.value);
      expect(enabledValue.value).toBe(false);
    });

    it("should enable the query when an experience ID is provided", () => {
      // GIVEN: An experience ID is set
      const testId = "test-id-123";
      experienceId.value = testId;

      // WHEN: The composable is initialized
      useOptionsQuery(experienceId);

      // THEN: The query's enabled status should be true
      const queryOptions = mockUseQuery.mock.calls[0][0];
      const enabledValue = computed(() => queryOptions.enabled.value);
      expect(enabledValue.value).toBe(true);
    });

    it("should update the enabled status reactively if the experience ID changes", () => {
      // GIVEN: The composable is initialized with an undefined ID
      useOptionsQuery(experienceId);
      const queryOptions = mockUseQuery.mock.calls[0][0];
      const enabledValue = computed(() => queryOptions.enabled.value);

      // THEN: Initially, the query is disabled
      expect(enabledValue.value).toBe(false);

      // WHEN: The experience ID is updated to a defined value
      experienceId.value = "new-id-456";

      // THEN: The query should become enabled
      expect(enabledValue.value).toBe(true);

      // WHEN: The experience ID is set back to undefined
      experienceId.value = undefined;

      // THEN: The query should become disabled again
      expect(enabledValue.value).toBe(false);
    });
  });

  // Scenario: Query Function Execution
  describe("Query Function Execution", () => {
    const testId = "experience-abc";
    const mockApiResponse = { data: { success: true }, status: 200 };

    beforeEach(() => {
      // GIVEN: A valid experience ID is set for these tests
      experienceId.value = testId;
      // GIVEN: The API call is mocked to return a successful response
      mockGetOptions.mockResolvedValue(mockApiResponse);
    });

    it("should call the getOptions API with the correct experience ID when executed", async () => {
      // GIVEN: (Setup in beforeEach) experienceId is set, getOptions is mocked

      // WHEN: The composable is initialized and the query function is invoked
      useOptionsQuery(experienceId);
      const queryOptions = mockUseQuery.mock.calls[0][0];
      await queryOptions.queryFn(); // Simulate query execution

      // THEN: The getOptions mock should have been called exactly once with the correct ID
      expect(mockGetOptions).toHaveBeenCalledTimes(1);
      expect(mockGetOptions).toHaveBeenCalledWith(testId);
    });
  });

  // Scenario: Data Selection and Transformation
  describe("Data Selection Logic", () => {
    it('should extract the "data" property from the API response', async () => {
      // GIVEN: A valid experience ID and a mocked API response structure
      experienceId.value = "select-test-id";
      const mockResponse = { data: { options: ["A", "B"] }, status: 200, headers: {} };
      mockGetOptions.mockResolvedValue(mockResponse); // Mock getOptions return

      // WHEN: The composable is initialized, queryFn runs, and select is applied
      useOptionsQuery(experienceId);
      const queryOptions = mockUseQuery.mock.calls[0][0];
      const resultFromQueryFn = await queryOptions.queryFn(); // Simulate fetch
      const selectedData = queryOptions.select(resultFromQueryFn); // Apply select

      // THEN: The selected data should be exactly the content of the 'data' property
      expect(selectedData).toEqual(mockResponse.data);
    });
  });

  // Scenario: Composable Return Value
  describe("Composable Return Value", () => {
    it("should return the reactive result object provided by useQuery", () => {
      // GIVEN: A mocked result object from useQuery
      const mockQueryResult = {
        data: ref({ options: ["X", "Y"] }),
        isLoading: ref(false),
        isSuccess: ref(true),
        // ... potentially other reactive refs returned by useQuery
      };
      mockUseQuery.mockReturnValue(mockQueryResult); // Configure useQuery mock return

      // WHEN: The composable is initialized
      const result = useOptionsQuery(experienceId);

      // THEN: The composable should return the exact object provided by the useQuery mock
      expect(result).toBe(mockQueryResult);
    });
  });
});
