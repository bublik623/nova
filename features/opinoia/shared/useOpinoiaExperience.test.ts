import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, Ref, readonly, nextTick } from "vue";

// Import the composable to test and its types
import { useOpinoiaExperience } from "./useOpinoiaExperience"; // Adjust path
import { AvailableLanguage } from "@/types/Language"; // Adjust path

// Import dependencies to mock
import { useDistributionContentQuery } from "@/features/experience-raw/queries/distribution-content-query"; // Adjust path
import { useMasterLanguage } from "./i18n/useMasterLanguage"; // Adjust path
import { useTranslationQuery } from "./translations/useTranslationQuery"; // Adjust path
import { useExperienceRawQuery } from "@/features/experience-raw/queries/experience-raw-query"; // Adjust path

// --- Mock Dependencies ---
vi.mock("@/features/experience-raw/queries/experience-raw-query", () => ({
  useExperienceRawQuery: vi.fn(),
}));
vi.mock("@/features/experience-raw/queries/distribution-content-query", () => ({
  useDistributionContentQuery: vi.fn(),
}));
vi.mock("./i18n/useMasterLanguage", () => ({
  useMasterLanguage: vi.fn(),
}));
vi.mock("./translations/useTranslationQuery", () => ({
  useTranslationQuery: vi.fn(),
}));

// Define simplified mock data structures based on usage in the composable
type MockRawData = { commercial: { title: string; status_code: "IN_CREATION" } };
type MockDistData = { reference_code: string };
type MockTranslationData = { title: string }; // Assuming select already extracted the object

describe("useOpinoiaExperience", () => {
  // --- Test Setup Variables ---
  let experienceId: Ref<string>;
  let mockMasterLanguage: Ref<AvailableLanguage>;

  // Refs to control the 'data.value' of the mocked queries
  let mockRawQueryDataRef: Ref<MockRawData | undefined>;
  let mockDistQueryDataRef: Ref<MockDistData | undefined>;
  let mockTranslationQueryDataRef: Ref<MockTranslationData | undefined>;

  beforeEach(() => {
    vi.resetAllMocks(); // Use reset for mocks between tests

    experienceId = ref("exp-abc");
    mockMasterLanguage = ref<AvailableLanguage>("en");

    // Initialize mock data refs
    mockRawQueryDataRef = ref(undefined);
    mockDistQueryDataRef = ref(undefined);
    mockTranslationQueryDataRef = ref(undefined);

    // Configure mocks to return simulated TanStack Query structure with controllable data refs
    // Use 'any' cast for simplicity, or define more accurate partial QueryResult types
    vi.mocked(useExperienceRawQuery).mockReturnValue({
      data: mockRawQueryDataRef,
      // Add other query states like isLoading: ref(false) if needed
    } as any);
    vi.mocked(useDistributionContentQuery).mockReturnValue({
      data: mockDistQueryDataRef,
    } as any);
    vi.mocked(useTranslationQuery).mockReturnValue({
      data: mockTranslationQueryDataRef,
    } as any);
    vi.mocked(useMasterLanguage).mockReturnValue(readonly(mockMasterLanguage)); // Return readonly ref
  });

  // --- Tests ---

  it("should call underlying composables with correct arguments", () => {
    useOpinoiaExperience(readonly(experienceId));

    expect(useExperienceRawQuery).toHaveBeenCalledTimes(1);
    expect(useExperienceRawQuery).toHaveBeenCalledWith(readonly(experienceId));

    expect(useDistributionContentQuery).toHaveBeenCalledTimes(1);
    expect(useDistributionContentQuery).toHaveBeenCalledWith(readonly(experienceId));

    expect(useMasterLanguage).toHaveBeenCalledTimes(1);

    expect(useTranslationQuery).toHaveBeenCalledTimes(1);
    // Check that the ref returned by useMasterLanguage was passed
    expect(useTranslationQuery).toHaveBeenCalledWith(readonly(experienceId), readonly(mockMasterLanguage));
  });

  it("should compute id correctly from experienceId", () => {
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.id).toBe("exp-abc");
    experienceId.value = "exp-xyz";
    expect(result.value.id).toBe("exp-xyz");
  });

  // --- Title Fallback Logic Tests ---
  it("should compute title from translation query when available", () => {
    mockTranslationQueryDataRef.value = { title: "Translated Title" };
    mockRawQueryDataRef.value = { commercial: { title: "Raw Title" } };
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.title).toBe("Translated Title");
  });

  it("should compute title from raw query when translation is unavailable", () => {
    mockTranslationQueryDataRef.value = undefined; // No translation data
    mockRawQueryDataRef.value = { commercial: { title: "Raw Title" } };
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.title).toBe("Raw Title");
  });

  it("should compute title from raw query when translation data lacks title", () => {
    mockTranslationQueryDataRef.value = {} as MockTranslationData; // Data exists but no title property
    mockRawQueryDataRef.value = { commercial: { title: "Raw Title" } };
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.title).toBe("Raw Title");
  });

  it("should compute title as empty string when neither source provides it", () => {
    mockTranslationQueryDataRef.value = undefined;
    mockRawQueryDataRef.value = undefined; // Or { commercial: {} }
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.title).toBe("");
  });

  // --- Reference Code Fallback Logic Tests ---
  it("should compute referenceCode from distribution query when available", () => {
    mockDistQueryDataRef.value = { reference_code: "DIST-123" };
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.referenceCode).toBe("DIST-123");
  });

  it("should compute referenceCode as empty string when distribution data is unavailable", () => {
    mockDistQueryDataRef.value = undefined;
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.referenceCode).toBe("");
  });

  it("should compute referenceCode as empty string when distribution data lacks reference_code", () => {
    mockDistQueryDataRef.value = {} as MockDistData;
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.referenceCode).toBe("");
  });

  // --- Stubbed Value Tests ---
  it("should return stubbed experienceState", () => {
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.experienceState).toBe("draft"); // Check stub
  });

  it("should return stubbed documents structure", () => {
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.documents).toEqual({
      RAW_COMMERCIAL: { type: "RAW_COMMERCIAL", state: "IN_CREATION" },
      OPERATIONAL: { type: "OPERATIONAL", state: "IN_CREATION" },
    }); // Check stub
  });

  // --- Reactivity Tests ---
  it("should update title reactively when translation data changes", async () => {
    mockTranslationQueryDataRef.value = undefined; // Start without translation
    mockRawQueryDataRef.value = { commercial: { title: "Raw Title" } };
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.title).toBe("Raw Title"); // Initial state

    // Act: Provide translation data
    mockTranslationQueryDataRef.value = { title: "New Translated Title" };
    await nextTick(); // Allow computed properties to update

    // Assert: Title should now come from translation
    expect(result.value.title).toBe("New Translated Title");
  });

  it("should update referenceCode reactively when distribution data changes", async () => {
    mockDistQueryDataRef.value = undefined; // Start without code
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.referenceCode).toBe(""); // Initial state

    // Act: Provide distribution data
    mockDistQueryDataRef.value = { reference_code: "DIST-XYZ" };
    await nextTick(); // Allow computed properties to update

    // Assert: Code should now be populated
    expect(result.value.referenceCode).toBe("DIST-XYZ");
  });

  it("should return the experience raw status", () => {
    const result = useOpinoiaExperience(readonly(experienceId));
    expect(result.value.documents.RAW_COMMERCIAL?.state).toBe("IN_CREATION");
  });
});
