import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, Ref, readonly } from "vue";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";

vi.mock("@tanstack/vue-query", () => ({
  useQuery: vi.fn(),
}));

// --- Import the composable AFTER mock definition ---
import { useTranslationQuery } from "./useTranslationQuery";

// --- Import other dependencies AFTER mock definition ---
import { useContentCommandApi } from "@/composables/useContentCommandApi"; // Adjust path as needed
import { AvailableLanguage } from "@/types/Language"; // Adjust path as needed
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";

// Mock the Content Command API composable
vi.mock("@/composables/useContentCommandApi", () => ({
  // Adjust path as needed
  useContentCommandApi: vi.fn(),
}));

// --- Test Suite ---
describe("useTranslationQuery", () => {
  let experienceId: Ref<string>;
  let languageCode: Ref<AvailableLanguage>;
  let mockGetTranslations: ReturnType<typeof vi.fn>;
  let mockedUseQuery: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Dynamically import the MOCKED library functions
    const vueQueryMock = await import("@tanstack/vue-query");
    mockedUseQuery = vueQueryMock.useQuery as ReturnType<typeof vi.fn>;

    vi.resetAllMocks();

    experienceId = ref("exp-111");
    languageCode = ref<AvailableLanguage>("en");
    mockGetTranslations = vi.fn();
    vi.mocked(useContentCommandApi).mockReturnValue({
      getTranslations: mockGetTranslations,
    });
  });

  // Helper function (remains the same)
  const getUseQueryOptions = () => {
    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    return mockedUseQuery.mock.calls[0][0];
  };

  // --- Tests ---

  it("should call useQuery with the correct initial queryKey", () => {
    useTranslationQuery(readonly(experienceId), readonly(languageCode));
    const options = getUseQueryOptions();
    expect(options.queryKey).toEqual(["translation", experienceId, languageCode]);
  });

  it("queryFn should call getTranslations with correct arguments", async () => {
    // Using a more specific type for mock data
    const mockTranslation: ExperienceTranslation = {
      experience_id: "t1",
      title: "Hello",
      language_code: "en",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "READY",
    };
    const mockApiResponse = { data: [mockTranslation] }; // AxiosResponse shape
    mockGetTranslations.mockResolvedValue(mockApiResponse);

    useTranslationQuery(readonly(experienceId), readonly(languageCode));
    const options = getUseQueryOptions();
    const queryFn = options.queryFn;
    await queryFn(); // Manually execute

    expect(mockGetTranslations).toHaveBeenCalledTimes(1);
    const expectedRsql = emit(builder.eq("experience_id", "exp-111"));
    expect(mockGetTranslations).toHaveBeenCalledWith("experience-translations", {
      params: { filters: expectedRsql, language_code: "en" },
    });
  });

  it("queryFn should use updated values when refs change", async () => {
    useTranslationQuery(readonly(experienceId), readonly(languageCode));
    const options = getUseQueryOptions();
    const queryFn = options.queryFn;

    experienceId.value = "exp-222";
    languageCode.value = "fr";
    await queryFn();

    const expectedRsql = emit(builder.eq("experience_id", "exp-222"));
    expect(mockGetTranslations).toHaveBeenCalledWith("experience-translations", {
      params: { filters: expectedRsql, language_code: "fr" },
    });
  });

  it("select function should return the first element of the data array", () => {
    useTranslationQuery(readonly(experienceId), readonly(languageCode));
    const options = getUseQueryOptions();
    const selectFn = options.select;

    const mockTranslation1: ExperienceTranslation = {
      experience_id: "t1",
      title: "Selected text",
      language_code: "en",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "READY",
    };
    const mockTranslation2: ExperienceTranslation = {
      experience_id: "t2",
      title: "Other text",
      language_code: "en",
      flow_code: "MANUAL_TRANSLATION",
      status_code: "READY",
    };
    // Simulate the expected AxiosResponse structure
    const mockApiResponse = {
      data: [mockTranslation1, mockTranslation2],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    const selectedData = selectFn(mockApiResponse);
    expect(selectedData).toEqual(mockTranslation1);
  });

  it("select function should return undefined if data array is empty", () => {
    useTranslationQuery(readonly(experienceId), readonly(languageCode));
    const options = getUseQueryOptions();
    const selectFn = options.select;

    const mockApiResponse = { data: [], status: 200, statusText: "OK", headers: {}, config: {} };

    const selectedData = selectFn(mockApiResponse);

    expect(selectedData).toBeUndefined();
  });
});
