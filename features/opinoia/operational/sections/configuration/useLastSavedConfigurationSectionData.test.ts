import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useConfigurationExperienceQuery } from "./queries/useConfigurationExperienceQuery";
import { useLastSavedConfigurationSectionData } from "./useLastSavedConfigurationSectionData";
import { usePaxesStore } from "@/features/experience-raw/stores/usePaxesStore";
import { AvailableLanguage } from "@/types/Language";
import { useExperienceLanguagesQuery } from "./queries/useExperienceLanguagesQuery";
import { useRefundPoliciesStore } from "@/features/experience-shared/stores/useRefundPoliciesStore";

interface Query<T> {
  isFetching: { value: boolean };
  data: { value?: T };
}

interface UseConfigurationExperienceQuery
  extends Query<{
    code: string;
  }> {}

interface useExperienceLanguagesQuery
  extends Query<{
    languages: AvailableLanguage[];
  }> {}

vi.mock("./queries/useConfigurationExperienceQuery");
vi.mock("@/features/experience-raw/stores/usePaxesStore");
vi.mock("./queries/useExperienceLanguagesQuery");
vi.mock("@/features/experience-shared/stores/useRefundPoliciesStore");
vi.mock("@/features/experience-calendar/utils/option-language-utils", () => ({
  mapMasterdataLanguagesToOptions: vi.fn((languages) => languages),
}));

describe("useLastSavedConfigurationSectionData", () => {
  // mock useConfigurationExperienceQuery
  let useConfigurationExperienceQueryMock: Partial<UseConfigurationExperienceQuery>;
  let useConfigurationExperienceQuerySpy: Mock;
  const EXPERIENCE_CODE = "test-123";
  // mock usePaxesStore
  let usePaxesStoreMock: any;
  let usePaxesStoreSpy: Mock;
  const PAXES = [
    {
      pax_type: "PERSON",
      pax_code: "abcdef",
      all_ages: true,
      free_of_charge: true,
    },
  ];
  // mock useExperienceLanguagesQuery
  let useExperienceLanguagesQueryMock: Partial<useExperienceLanguagesQuery>;
  let useExperienceLanguagesQuerySpy: Mock;
  const LANGUAGES: AvailableLanguage[] = ["en", "fr"];
  // mock useRefundPoliciesStore
  let useRefundPoliciesStoreMock: any;
  let useRefundPoliciesStoreSpy: Mock;
  const useRefundPoliciesStoreLoadSpy = vi.fn();
  const REFUND_POLICIES = [
    {
      experience: "lorem ipsum",
      period: "2025",
      refund_type_code: "lorem",
      value: 5,
      action: "NOOP",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // mock useConfigurationExperienceQuery
    useConfigurationExperienceQueryMock = {
      isFetching: ref(false),
      data: ref({
        code: EXPERIENCE_CODE,
      }),
    };
    useConfigurationExperienceQuerySpy = vi.fn((_experienceId) => useConfigurationExperienceQueryMock);
    vi.mocked(useConfigurationExperienceQuery as Mock).mockImplementation(useConfigurationExperienceQuerySpy);
    // mock usePaxesStore
    usePaxesStoreMock = {
      isLoading: false,
      fields: {
        paxes: {
          value: PAXES,
        },
      },
    };
    usePaxesStoreSpy = vi.fn(() => usePaxesStoreMock);
    vi.mocked(usePaxesStore).mockImplementation(usePaxesStoreSpy);
    // mock useExperienceLanguagesQuery
    useExperienceLanguagesQueryMock = {
      isFetching: ref(false),
      data: ref({
        languages: LANGUAGES,
      }),
    };
    useExperienceLanguagesQuerySpy = vi.fn((_experienceId) => useExperienceLanguagesQueryMock);
    vi.mocked(useExperienceLanguagesQuery as Mock).mockImplementation(useExperienceLanguagesQuerySpy);
    // mock useRefundPoliciesStore
    useRefundPoliciesStoreMock = {
      isLoading: false,
      field: {
        value: REFUND_POLICIES,
      },
      loadRefundPolicies: useRefundPoliciesStoreLoadSpy,
    };
    useRefundPoliciesStoreSpy = vi.fn(() => useRefundPoliciesStoreMock);
    vi.mocked(useRefundPoliciesStore).mockImplementation(useRefundPoliciesStoreSpy);
  });

  describe("configuration experience data", () => {
    it("should have been called with experienceId", () => {
      useLastSavedConfigurationSectionData(ref("123"));
      expect(useConfigurationExperienceQuerySpy.mock.calls[0][0].value).toBe("123");
    });

    it("should return data", () => {
      const { data, isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(data.value.configuration).toMatchObject({
        experienceCode: { value: EXPERIENCE_CODE },
      });
      expect(isLoading.value).toBe(false);
    });

    it("should return empty data if its data is undefined", () => {
      useConfigurationExperienceQueryMock.data = ref(undefined);
      const { data } = useLastSavedConfigurationSectionData(ref("123"));
      expect(data.value.configuration).toMatchObject({
        experienceCode: { value: "" },
      });
    });

    it("isLoading should be false if it is fetching", () => {
      useConfigurationExperienceQueryMock.isFetching = ref(true);
      const { isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(isLoading.value).toBe(true);
    });
  });

  describe("languages", () => {
    it("should have been called with experienceId", () => {
      useLastSavedConfigurationSectionData(ref("123"));
      expect(useExperienceLanguagesQuerySpy.mock.calls[0][0].value).toBe("123");
    });

    it("should return data", () => {
      const { data, isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(data.value.configuration).toMatchObject({
        languages: new Set(LANGUAGES),
      });
      expect(isLoading.value).toBe(false);
    });

    it("should return empty data if its data is undefined", () => {
      useExperienceLanguagesQueryMock.data = ref(undefined);
      const { data } = useLastSavedConfigurationSectionData(ref("123"));
      expect(data.value.configuration).toMatchObject({
        languages: new Set([]),
      });
    });

    it("isLoading should be false if it is fetching", () => {
      useExperienceLanguagesQueryMock.isFetching = ref(true);
      const { isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(isLoading.value).toBe(true);
    });
  });

  describe("paxes", () => {
    it("should return data", () => {
      const { data, isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(data.value.configuration).toMatchObject({
        paxes: { value: PAXES },
      });
      expect(isLoading.value).toBe(false);
    });

    it("isLoading should be false if it is fetching", () => {
      usePaxesStoreMock.isLoading = true;
      const { isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(isLoading.value).toBe(true);
    });
  });

  describe("refundPolicies", () => {
    it("loadRefundPolicies() should have been called with experienceId", async () => {
      const experienceId = ref("123");
      useLastSavedConfigurationSectionData(experienceId);
      expect(useRefundPoliciesStoreLoadSpy).not.toHaveBeenCalled();
      experienceId.value = "456";
      await nextTick();
      expect(useRefundPoliciesStoreLoadSpy).toHaveBeenCalledWith("456");
    });

    it("should return data", () => {
      const { data, isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(data.value.configuration).toMatchObject({
        refundPolicies: { value: REFUND_POLICIES },
      });
      expect(isLoading.value).toBe(false);
    });

    it("isLoading should be false if it is fetching", () => {
      useRefundPoliciesStoreMock.isLoading = true;
      const { isLoading } = useLastSavedConfigurationSectionData(ref("123"));
      expect(isLoading.value).toBe(true);
    });
  });
});
