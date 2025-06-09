import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ref, type Ref } from "vue";

import { useLastSavedOptionsSectionData } from "./useLastSavedOptionsSectionData";
import { useOptionsQuery } from "../queries/useOptionsQuery";
import { useOptionsPaxesQueries } from "../queries/useOptionsPaxesQueries";
import type { Option as ApiOption, OptionPaxes } from "@/types/generated/OfferServiceApi";
import type { UseQueryReturnType, QueryObserverResult } from "@tanstack/vue-query";

// --- Mocking Dependencies ---
vi.mock("../queries/useOptionsQuery");
vi.mock("../queries/useOptionsPaxesQueries");

// Type alias for the vue-query hook return type
type PartialOptionsQueryResult = Partial<UseQueryReturnType<ApiOption[], Error>>;
// Type alias for individual results within useQueries
type PartialPaxesQueryResult = Partial<QueryObserverResult<{ optionId: string; optionPaxes: OptionPaxes }, Error>>;

// --- Reusable Mock Data Constants ---
const MOCK_API_OPTION_1: ApiOption = {
  id: "opt1",
  name: "Option One",
  code: "C1",
  duration: "PT2H",
  experience: "exp1",
  multilanguage: false,
  capacity_type: "pax",
};
const MOCK_API_OPTION_2: ApiOption = {
  id: "opt2",
  name: "Option Two",
  code: "C2",
  duration: "PT0H30M",
  experience: "exp1",
  multilanguage: false,
  capacity_type: "pax",
};
const MOCK_API_OPTION_3: ApiOption = {
  id: "opt3",
  name: "Option Three",
  code: "C3",
  duration: undefined,
  experience: "exp1",
  multilanguage: false,
  capacity_type: "pax",
};
const MOCK_API_OPTION_4: ApiOption = {
  id: "opt4",
  name: "Option Four",
  code: "C4",
  duration: "PT1H",
  experience: "exp1",
  multilanguage: false,
  capacity_type: "pax",
};

const ALL_MOCK_API_OPTIONS = [MOCK_API_OPTION_1, MOCK_API_OPTION_2, MOCK_API_OPTION_3, MOCK_API_OPTION_4];

// Mock Paxes Query Results for success state (isFetching is boolean)
const MOCK_PAXES_RESULT_OPT1_SUCCESS: PartialPaxesQueryResult = {
  data: { optionId: "opt1", optionPaxes: { pax_list: [{ pax_code: "ADT" }, { pax_code: "CHD" }] } },
  isFetching: false,
  status: "success",
};
const MOCK_PAXES_RESULT_OPT2_SUCCESS: PartialPaxesQueryResult = {
  data: { optionId: "opt2", optionPaxes: { pax_list: [] } },
  isFetching: false,
  status: "success",
};
const MOCK_PAXES_RESULT_OPT3_SUCCESS: PartialPaxesQueryResult = {
  data: { optionId: "opt3", optionPaxes: { pax_list: [{ pax_code: "INF" }] } },
  isFetching: false,
  status: "success",
};

const ALL_MOCK_PAXES_RESULTS_SUCCESS = [
  MOCK_PAXES_RESULT_OPT1_SUCCESS,
  MOCK_PAXES_RESULT_OPT2_SUCCESS,
  MOCK_PAXES_RESULT_OPT3_SUCCESS,
];

// --- Test Suite ---
describe("useLastSavedOptionsSectionData", () => {
  let mockOptionsQueryResult: PartialOptionsQueryResult;
  let mockOptionsPaxesQueriesResults: Ref<PartialPaxesQueryResult[]>;

  const mockedUseOptionsQuery = useOptionsQuery as Mock;
  const mockedUseOptionsPaxesQueries = useOptionsPaxesQueries as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock setup: useQuery result state properties are refs
    mockOptionsQueryResult = { data: ref([]), isFetching: ref(false), status: ref("success") };
    mockOptionsPaxesQueriesResults = ref([]);

    // Configure mocks - Use type assertions to treat Partial as Full type
    mockedUseOptionsQuery.mockReturnValue(mockOptionsQueryResult as UseQueryReturnType<ApiOption[], Error>);
    mockedUseOptionsPaxesQueries.mockImplementation(
      () =>
        mockOptionsPaxesQueriesResults as Ref<
          QueryObserverResult<{ optionId: string; optionPaxes: OptionPaxes }, Error>[]
        >
    );
  });

  describe("Given any query is fetching data", () => {
    it("Then isLoading should be true if options query is fetching", () => {
      mockOptionsQueryResult.isFetching!.value = true;
      mockOptionsQueryResult.status = ref("pending");
      mockOptionsPaxesQueriesResults.value = [
        { ...MOCK_PAXES_RESULT_OPT1_SUCCESS, isFetching: false, status: "success" },
      ];
      const experienceId = ref("exp1");

      const { isLoading } = useLastSavedOptionsSectionData(experienceId);

      expect(isLoading.value).toBe(true);
    });

    it("Then isLoading should be true if any options paxes query is fetching", () => {
      mockOptionsQueryResult = {
        data: ref([MOCK_API_OPTION_1, MOCK_API_OPTION_2]),
        isFetching: ref(false),
        status: ref("success"),
      };
      mockedUseOptionsQuery.mockReturnValue(mockOptionsQueryResult as UseQueryReturnType<ApiOption[], Error>);

      mockOptionsPaxesQueriesResults.value = [
        // Mock for a paxes query in 'pending' state (data must be undefined)
        {
          isFetching: true,
          status: "pending",
          data: undefined,
          error: null,
          isSuccess: false,
          isError: false,
          isLoading: true,
        },
        // Mock for a paxes query in 'success' state
        { ...MOCK_PAXES_RESULT_OPT2_SUCCESS, isFetching: false, status: "success" },
      ];
      const experienceId = ref("exp1");

      const { isLoading } = useLastSavedOptionsSectionData(experienceId);

      expect(isLoading.value).toBe(true);
    });

    it("Then isLoading should be false if all queries finished fetching", () => {
      mockOptionsQueryResult = { data: ref([MOCK_API_OPTION_1]), isFetching: ref(false), status: ref("success") };
      mockedUseOptionsQuery.mockReturnValue(mockOptionsQueryResult as UseQueryReturnType<ApiOption[], Error>);
      mockOptionsPaxesQueriesResults.value = [
        { ...MOCK_PAXES_RESULT_OPT1_SUCCESS, isFetching: false, status: "success" },
      ];
      const experienceId = ref("exp1");

      const { isLoading } = useLastSavedOptionsSectionData(experienceId);

      expect(isLoading.value).toBe(false);
    });
  });

  describe("Given queries have successfully fetched data", () => {
    beforeEach(() => {
      mockOptionsQueryResult = { data: ref(ALL_MOCK_API_OPTIONS), isFetching: ref(false), status: ref("success") };
      mockedUseOptionsQuery.mockReturnValue(mockOptionsQueryResult as UseQueryReturnType<ApiOption[], Error>);
      mockOptionsPaxesQueriesResults.value = ALL_MOCK_PAXES_RESULTS_SUCCESS;
    });

    it("Then isLoading should be false", () => {
      const experienceId = ref("exp1");
      const { isLoading } = useLastSavedOptionsSectionData(experienceId);
      expect(isLoading.value).toBe(false);
    });

    it("Then data.options should contain correctly mapped options", () => {
      const experienceId = ref("exp1");
      const { data } = useLastSavedOptionsSectionData(experienceId);

      // Check overall structure and length
      expect(data.value.options).toHaveLength(ALL_MOCK_API_OPTIONS.length);

      // Check individual option mappings
      expect(data.value.options[0]).toEqual({
        id: "opt1",
        title: "Option One",
        code: "C1",
        duration: 2,
        subchannels: [],
        paxTypes: ["ADT", "CHD"],
      }); // Check pax list mapping
      expect(data.value.options[1]).toEqual({
        id: "opt2",
        title: "Option Two",
        code: "C2",
        duration: 0.5,
        subchannels: [],
        paxTypes: "all",
      }); // Check 'all' paxes mapping
      expect(data.value.options[2]).toEqual({
        id: "opt3",
        title: "Option Three",
        code: "C3",
        duration: undefined,
        subchannels: [],
        paxTypes: ["INF"],
      }); // Check undefined duration
      expect(data.value.options[3]).toEqual({
        id: "opt4",
        title: "Option Four",
        code: "C4",
        duration: 1,
        subchannels: [],
        paxTypes: [],
      }); // Check missing paxes data resulting in empty array
    });
  });

  describe("Given useOptionsQuery returns empty data", () => {
    beforeEach(() => {
      mockOptionsQueryResult = { data: ref([]), isFetching: ref(false), status: ref("success") };
      mockedUseOptionsQuery.mockReturnValue(mockOptionsQueryResult as UseQueryReturnType<ApiOption[], Error>);
      mockOptionsPaxesQueriesResults.value = [];
    });

    it("Then data.options should be an empty array", () => {
      const experienceId = ref("exp1");
      const { data } = useLastSavedOptionsSectionData(experienceId);
      expect(data.value.options).toEqual([]);
    });

    it("Then isLoading should be false", () => {
      const experienceId = ref("exp1");
      const { isLoading } = useLastSavedOptionsSectionData(experienceId);
      expect(isLoading.value).toBe(false);
    });

    // Check that the dependency array for the second query hook is empty
    it("Then useOptionsPaxesQueries should be called with an empty array dependency", () => {
      const experienceId = ref("exp1");
      useLastSavedOptionsSectionData(experienceId); // Needs to be called to compute dependencies
      expect(mockedUseOptionsPaxesQueries).toHaveBeenCalledWith(expect.objectContaining({ value: [] }));
    });
  });

  describe("Given experienceId changes", () => {
    // This test primarily verifies that the reactive dependencies are passed correctly during setup
    it("Then useOptionsQuery should be called with the reactive ref", () => {
      const experienceId = ref<string | undefined>("exp1");
      mockOptionsQueryResult = { data: ref(undefined), isFetching: ref(true), status: ref("pending") };
      mockedUseOptionsQuery.mockReturnValue(mockOptionsQueryResult as UseQueryReturnType<ApiOption[], Error>);

      useLastSavedOptionsSectionData(experienceId);

      // Check that the hooks were called with the ref itself during initial setup
      expect(mockedUseOptionsQuery).toHaveBeenCalledWith(experienceId);
      expect(mockedUseOptionsPaxesQueries).toHaveBeenCalledTimes(1); // Called once during setup

      // Change the ref value - reactivity is handled by Vue internally
      experienceId.value = "exp2";

      // Verify mocks were only called once during this test's setup phase
      expect(mockedUseOptionsQuery).toHaveBeenCalledTimes(1);
    });
  });
});
