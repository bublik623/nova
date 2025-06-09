import { setActivePinia, createPinia } from "pinia";
import { describe, expect, test, beforeEach, vi } from "vitest";
import { useExperienceTranslationStore } from "../useExperienceTranslationStore";
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import * as fetchTranslationMock from "../../lib/fetch-translation";
import * as updateTranslationMock from "../../lib/update-translation";
import * as getAllCustomHighlightsMock from "@/features/experience-highlights/lib/get-all-custom-highlights";
import * as getAllPremadeHighlightsMock from "@/features/experience-highlights/lib/get-all-premade-highlights";
import { mockCustomHighlightsPayload } from "@/features/experience-highlights/lib/__mocks__/mock-custom-highlights-payload";

vi.stubGlobal("refreshNuxtData", () => {});

const TEST_ID = "translation-id";
const TEST_LANGUAGE = "en";

const mockContentCommandPayload: ExperienceTranslation & {
  language_code: AvailableLanguage;
} = {
  id: TEST_ID,
  title: "test title",
  seo_title: "test seo title",
  text1: "test description",
  text2: "bbb",
  seo_description: "test seo description",
  info_voucher: "test info voucher",
  experience_id: "experience-id",
  language_code: "it",
  flow_code: "MANUAL_TRANSLATION",
  status_code: "IN_REVIEW",
};

const fetchTranslationSpy = vi.spyOn(fetchTranslationMock, "fetchTranslation");

fetchTranslationSpy.mockImplementation(() => Promise.resolve(mockContentCommandPayload));

const updateTranslationSpy = vi.spyOn(updateTranslationMock, "updateTranslation");

const mockAllCustomHighlightsPayload = {
  custom_highlights: mockCustomHighlightsPayload("highlights"),
  custom_important_information: mockCustomHighlightsPayload("important-information"),
  custom_included: mockCustomHighlightsPayload("included"),
  custom_non_included: mockCustomHighlightsPayload("non-included"),
};

const getAllCustomHighlightsSpy = vi.spyOn(getAllCustomHighlightsMock, "getAllCustomHighlights");

getAllCustomHighlightsSpy.mockImplementation(() => Promise.resolve(mockAllCustomHighlightsPayload));

const mockAllPremadeHighlightsPayload = {
  premade_highlights: mockCustomHighlightsPayload("highlights"),
  premade_important_information: mockCustomHighlightsPayload("important-information"),
  premade_included: mockCustomHighlightsPayload("included"),
  premade_non_included: mockCustomHighlightsPayload("non-included"),
};

const getAllPremadeHighlightsSpy = vi.spyOn(getAllPremadeHighlightsMock, "getAllPremadeHighlights");

getAllPremadeHighlightsSpy.mockImplementation(() => Promise.resolve(mockAllPremadeHighlightsPayload));

const statuses = {
  READY: { id: "ready" },
};

const masterdataStoreMock = {
  getStatusByCode: vi.fn((code: keyof typeof statuses) => statuses[code]),
  getFlowByCode: vi.fn(() => ({
    id: "a8b6245d-429c-4eae-b7c1-123",
    code: "DUMMY",
    init_status: "bc67d0c5-7458-463b-96a8-4344d26dd079",
    end_status: "bc67d0c5-7458-463b-96a8-4344d26dd079",
    creation_date: "2022-07-28T14:13:44.787283",
    updated_date: "2022-07-28T14:13:44.787283",
  })),
};

const useContentCommandApiMock = {
  publishTranslation: vi.fn(),
};

const mockExperienceRawApi = {
  getDistributionContent: vi.fn(() => ({
    data: [
      {
        id: TEST_ID,
        supplier_id: "supplierId",
        translations_content: [{ language_code: TEST_LANGUAGE }],
        media_content: { distribution_status: "READY" },
        translation_content_list: [{ language_code: "en", distribution_status: "READY" }],
        global_status: "PUBLISHED",
      },
    ],
  })),
};
vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => mockExperienceRawApi,
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterdataStoreMock,
}));

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => useContentCommandApiMock,
}));

const loggerMock = { logError: vi.fn() };

vi.mock("@/features/core-shared/composables/useLogger", () => ({
  useLogger: () => loggerMock,
}));

describe("Experience Translation Store", () => {
  setActivePinia(createPinia());
  const store = useExperienceTranslationStore();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("it should load a document correctly", async () => {
    expect(store.validation.formValidationState).toBe("INDETERMINATE");

    await store.loadTranslation(TEST_LANGUAGE, TEST_ID);

    // the translation store in the store should not return the id.
    const { id: _, ...translationWithoutId } = mockContentCommandPayload;

    expect(fetchTranslationSpy).toHaveBeenCalledWith(TEST_LANGUAGE, TEST_ID);
    expect(store.translationId).toBe(TEST_ID);
    expect(store.loaded).toBe(true);
    expect(store.modified).toBe(false);
    expect(store.translation).toStrictEqual({
      ...translationWithoutId,
      ...mockAllCustomHighlightsPayload,
      ...mockAllPremadeHighlightsPayload,
    });
    expect(store.validation.formValidationState).toBe("VALID");
  });

  test("if there is no id, it should error", async () => {
    fetchTranslationSpy.mockImplementationOnce(() => Promise.resolve({ ...mockContentCommandPayload, id: undefined }));

    await expect(store.loadTranslation(TEST_LANGUAGE, "")).rejects.toThrow("Cannot load a translation without id!");
  });

  test("if there is no title, the validation should not pass", async () => {
    await store.loadTranslation("en", TEST_ID);

    store.translation.title = "";

    store.validation.runValidation();

    expect(store.validation.formIsValid).toBe(false);
    expect(store.validation.formValidationState).toBe("INVALID");
  });

  test("if a highlight is missing its name, the validation should not pass", async () => {
    await store.loadTranslation("en", TEST_ID);

    store.translation.custom_highlights[0].name = "";

    store.validation.runValidation();

    expect(store.validation.formIsValid).toBe(false);
    expect(store.validation.formValidationState).toBe("INVALID");
  });

  test("if a highlight is an empty array, the validation should pass", async () => {
    await store.loadTranslation("en", TEST_ID);

    store.translation.custom_highlights = [];

    store.validation.runValidation();

    expect(store.validation.formIsValid).toBe(true);
    expect(store.validation.formValidationState).toBe("VALID");
  });

  test("it should update a document correctly", async () => {
    await store.loadTranslation("en", TEST_ID);
    await store.saveTranslation();

    const { id: _, ...translationWithoutId } = mockContentCommandPayload;

    expect(updateTranslationSpy).toHaveBeenCalledWith(TEST_ID, {
      translation: {
        ...translationWithoutId,
        automatic_translation: false,
        to_be_translated: false,
        status_code: "IN_REVIEW",
        flow_code: "MANUAL_TRANSLATION",
      },
      highlights: mockAllCustomHighlightsPayload,
    });
  });

  test("it should log the error in case the update fails", async () => {
    updateTranslationSpy.mockImplementation(() => Promise.reject(new Error("test-error")));

    await store.saveTranslation();

    expect(loggerMock.logError).toHaveBeenCalledWith("update-translation", new Error("test-error"));
  });

  test("if there is no translation id, it should error", async () => {
    await store.loadTranslation("en", TEST_ID);

    store.translationId = "";

    await expect(() => store.saveTranslation()).rejects.toThrowError(
      "Cannot save a translation without translation ID."
    );
  });

  describe("if a call fail on load", () => {
    setActivePinia(createPinia());
    const store = useExperienceTranslationStore();

    test("it should throw an error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementationOnce(() => {});
      expect(store.validation.formValidationState).toBe("INDETERMINATE");
      fetchTranslationSpy.mockRejectedValueOnce("err");

      await expect(store.loadTranslation(TEST_LANGUAGE, TEST_ID)).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith("err");
    });
  });

  describe("publishTranslationExperience", () => {
    test("it should call the correct endpoint and update the status", async () => {
      setActivePinia(createPinia());
      await store.loadTranslation("it", TEST_ID);
      await store.publishTranslationExperience();

      expect(useContentCommandApiMock.publishTranslation).toHaveBeenCalledWith("experience-id", "it");
      expect(store.translation.status_code).toBe("READY");
    });
  });
});
