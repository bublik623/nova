import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ref } from "vue";
import { useAllotmentQuery } from "./queries/useAllotmentQuery";
import { Allotment } from "@/types/generated/OfferServiceApi";
import { useLastSavedAllotmentSectionData } from "./useLastSavedAllotmentSectionData";
import { useLogger } from "@/features/core-shared/composables/useLogger";

interface Query<T> {
  isFetching: { value: boolean };
  data: { value?: T };
}

interface UseAllotmentQuery extends Query<Allotment[]> {}

vi.mock("./queries/useAllotmentQuery");
vi.mock("@/features/core-shared/composables/useLogger");
vi.mock("@/features/opinoia/shared/utils/date-utils", () => ({
  getDateRange: vi.fn((dateFrom, dateTo) => ({ dateFrom, dateTo })),
}));

describe("useLastSavedAllotmentSectionData", () => {
  let useAllotmentQueryQueryMock: Partial<UseAllotmentQuery>;
  let useAllotmentQueryQuerySpy: Mock;
  const ALLOTMENT_MOCK = {
    experience_id: "fedcba0987654321",
    date_from: "2025-05-19",
    date_to: "2025-05-25",
    languages: ["en", "fr"],
  };
  // mock useLogger
  let useLoggerMock: {
    logError: Mock;
  };
  let logErrorSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useAllotmentQueryQueryMock = {
      isFetching: ref(false),
      data: ref([ALLOTMENT_MOCK]),
    };
    useAllotmentQueryQuerySpy = vi.fn((_experienceId) => useAllotmentQueryQueryMock);
    vi.mocked(useAllotmentQuery as Mock).mockImplementation(useAllotmentQueryQuerySpy);
    // mock useLogger
    logErrorSpy = vi.fn();
    useLoggerMock = {
      logError: logErrorSpy,
    };
    vi.mocked(useLogger as Mock).mockImplementation(vi.fn(() => useLoggerMock));
  });

  describe("useAllotmentQuery data", () => {
    it("should have been called with experienceId", () => {
      useLastSavedAllotmentSectionData(ref("123"));
      expect(useAllotmentQueryQuerySpy.mock.calls[0][0].value).toBe("123");
    });

    it("should return data", () => {
      const { data, isLoading } = useLastSavedAllotmentSectionData(ref("123"));
      expect(data.value.allotments[0]).toMatchObject({
        languages: ["en", "fr"],
        dates: { dateFrom: ALLOTMENT_MOCK.date_from, dateTo: ALLOTMENT_MOCK.date_to },
      });
      expect(isLoading.value).toBe(false);
    });

    it("should return empty data if its data is undefined", () => {
      useAllotmentQueryQueryMock.data = ref(undefined);
      const { data } = useLastSavedAllotmentSectionData(ref("123"));
      expect(data.value.allotments).toMatchObject([]);
    });

    it("should return empty language array and log the error if languages are invalid", () => {
      useAllotmentQueryQueryMock.data = ref([
        {
          ...ALLOTMENT_MOCK,
          languages: ["en", "ee"],
        },
      ]);
      const { data } = useLastSavedAllotmentSectionData(ref("123"));
      expect(data.value.allotments[0]).toMatchObject({
        languages: [],
      });
      expect(logErrorSpy).toHaveBeenCalledWith("load-allotments", new Error("Invalid allotment's languages"));
    });

    it("isLoading should be false if it is fetching", () => {
      useAllotmentQueryQueryMock.isFetching = ref(true);
      const { isLoading } = useLastSavedAllotmentSectionData(ref("123"));
      expect(isLoading.value).toBe(true);
    });
  });
});
