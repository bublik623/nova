import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { useExperienceTranslationFlow } from "../useExperienceTranslationFlow";

const TEST_ID = "test-id";
const TEST_LANGUAGE = "en";

const mockCurationDocument = {
  title: "Hello world!",
};

const experienceCurationStoreMock = {
  curationDocuments: {
    [TEST_ID]: mockCurationDocument,
  },
};

const mockRouter = {
  push: vi.fn(),
};

const useMasterDataMock = {
  getStatusByCode: vi.fn(() => {}),
};

const useContentCommandApiMock = {
  publishTranslation: vi.fn(),
};

vi.stubGlobal("useRouter", () => mockRouter);

vi.mock("@/stores/experience-curation", () => ({
  useExperienceCuration: () => experienceCurationStoreMock,
}));

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => useMasterDataMock,
}));

vi.mock("@/composables/useContentCommandApi", () => ({
  useContentCommandApi: () => useContentCommandApiMock,
}));

const experienceTranslationStoreDocument = {
  translation: {
    experience_id: "",
    language_code: "",
    title: "",
    custom_highlights: [],
    custom_important_information: [],
    custom_included: [],
    custom_non_included: [],
  },
};
const experienceTranslationStoreMock = {
  ...experienceTranslationStoreDocument,
  isSaving: false,
  loaded: true,
  modified: false,
  $patch: vi.fn(),
  validation: {
    runValidation: vi.fn(),
  },
  saveTranslation: vi.fn(),
};

vi.mock("@/features/experience-translation/stores/useExperienceTranslationStore", () => ({
  useExperienceTranslationStore: () => experienceTranslationStoreMock,
}));

const notificationStoreMock = {
  addNotification: vi.fn(),
};
vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

const asterixIntegrationStoreMock = {
  isSaving: false,
};

vi.mock("@/features/experience-translation/asterix-integration/stores/useTranslationAsterixIntegrationStore", () => ({
  useTranslationAsterixIntegrationStore: () => asterixIntegrationStoreMock,
}));

describe("useExperienceTranslationFlow", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test("it returns the stores correctly", () => {
    const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);

    expect(flow.curationDocument.value).toStrictEqual(mockCurationDocument);
    expect(flow.translationStore).toStrictEqual(experienceTranslationStoreMock);
  });

  test("it updates the translation correctly", async () => {
    const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);

    await flow.updateStore({ title: "Updated title!" });

    expect(experienceTranslationStoreMock.$patch).toHaveBeenCalledWith({
      ...experienceTranslationStoreDocument,
      translation: {
        ...experienceTranslationStoreDocument.translation,
        title: "Updated title!",
      },
    });
  });

  test("it if the document is not loaded it errors", async () => {
    const flow = useExperienceTranslationFlow(TEST_LANGUAGE, "will error");
    experienceTranslationStoreMock.loaded = false;

    await expect(() => flow.updateStore({ title: "Updated title!" })).rejects.toThrowError(
      "Cannot update a translation document which is not loaded."
    );
  });

  describe("isSaving", () => {
    beforeEach(() => {
      experienceTranslationStoreMock.isSaving = false;
      asterixIntegrationStoreMock.isSaving = false;
    });

    test("it should return true when translationStore is saving", () => {
      const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);

      experienceTranslationStoreMock.isSaving = true;

      expect(flow.isSaving.value).toBe(true);
    });

    test("it should return true when translationAsterixIntegrationStore is saving", () => {
      const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);

      asterixIntegrationStoreMock.isSaving = true;

      expect(flow.isSaving.value).toBe(true);
    });

    test("it should return false when both of translationStore and translationAsterixIntegrationStore are not saving", () => {
      const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);

      expect(flow.isSaving.value).toBe(false);
    });
  });

  describe("handleEventBusSaveDraft", () => {
    test("it should call the action to save the experience", async () => {
      const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);
      await flow.handleEventBusSaveDraft({ publish: false, nextSectionRoute: "", afterSaving: () => null });
      expect(experienceTranslationStoreMock.saveTranslation).toHaveBeenCalled();
    });

    test("it should show a notification", async () => {
      const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);
      await flow.handleEventBusSaveDraft({ publish: false, nextSectionRoute: "", afterSaving: () => null });
      expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
        message: "notifications.success.saving.document",
        theme: "success",
      });
    });

    describe("when there is an error", () => {
      test("it should show a message", async () => {
        experienceTranslationStoreMock.saveTranslation.mockImplementationOnce(() => Promise.reject());
        const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);
        await flow.handleEventBusSaveDraft({ publish: false, nextSectionRoute: "", afterSaving: () => null });
        expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
          message: "notifications.error.saving.document",
          theme: "error",
        });
      });
    });

    describe("if the afterSaving function is passed", () => {
      test("it should call the function", async () => {
        let any = 0;
        const flow = useExperienceTranslationFlow(TEST_LANGUAGE, TEST_ID);
        await flow.handleEventBusSaveDraft({ publish: false, nextSectionRoute: "", afterSaving: () => any++ });
        expect(any).toBe(1);
      });
    });
  });
});
