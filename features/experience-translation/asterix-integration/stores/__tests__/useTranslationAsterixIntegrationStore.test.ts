import { vi, describe, test, beforeEach, expect } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTranslationAsterixIntegrationStore } from "../useTranslationAsterixIntegrationStore";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import { AvailableLanguage } from "@/types/Language";

const translationsListFieldFactoryMock = vi.hoisted(() => vi.fn());

vi.mock(
  "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField")
    >()),
    useAsterixServiceAndModalitiesTitleTranslationsListField: translationsListFieldFactoryMock,
  })
);

const useRouteMock = vi.hoisted(() => vi.fn());

vi.mock("vue-router", () => ({
  useRoute: useRouteMock,
}));

const experienceId = vi.hoisted(() => "exp-id");
const languageCode = vi.hoisted(() => "it");
const lastSavedValue: ServiceAndModalitiesTitleListValue = [
  { serviceCode: "SVC-1", title: "svc title", modalities: [{ modalityCode: "MOD-1", title: "mod title " }] },
];

describe("useTranslationAsterixIntegrationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    useRouteMock.mockReturnValueOnce({ params: { id: experienceId, language: languageCode } });
  });

  test("initialize title translations list field value from its last saved value", () => {
    translationsListFieldFactoryMock.mockImplementation(
      (expId: Ref<string>, translationLanguage: Ref<AvailableLanguage>) => {
        expect(expId.value).toBe(experienceId);
        expect(translationLanguage.value).toBe(languageCode);
        return { lastSavedValue: ref(lastSavedValue) };
      }
    );

    const store = useTranslationAsterixIntegrationStore();

    expect(store.values.serviceAndModalitiesTitleTranslationList).toStrictEqual(lastSavedValue);
  });

  describe("save", () => {
    const saveMock = vi.fn();
    beforeEach(() => {
      translationsListFieldFactoryMock.mockReturnValue({ lastSavedValue, save: saveMock });
    });

    test("it should not save title translations list field value if it isn't updated", async () => {
      const store = useTranslationAsterixIntegrationStore();

      await store.save();

      expect(saveMock).not.toHaveBeenCalled();
    });

    test("it should save title translations list field value if it's updated", async () => {
      const newValue: ServiceAndModalitiesTitleListValue = [
        {
          serviceCode: "SVC-1",
          title: "svc new title",
          modalities: [{ modalityCode: "MOD-1", title: "mod new title " }],
        },
      ];

      const store = useTranslationAsterixIntegrationStore();

      store.values.serviceAndModalitiesTitleTranslationList = newValue;

      await store.save();

      expect(saveMock).toHaveBeenCalledWith(newValue);
    });
  });

  describe("$reset", () => {
    test("it should set fields to their last saved values", () => {
      const lastSavedValue: ServiceAndModalitiesTitleListValue = [
        {
          serviceCode: "SVC-1",
          title: "original SVC-1 title",
          modalities: [{ modalityCode: "MOD-1", title: "original MOD-1 title" }],
        },
      ];
      translationsListFieldFactoryMock.mockReturnValueOnce({ lastSavedValue: ref(lastSavedValue) });

      const newValue: ServiceAndModalitiesTitleListValue = [
        {
          serviceCode: "SVC-1",
          title: "svc new title",
          modalities: [{ modalityCode: "MOD-1", title: "mod new title " }],
        },
      ];

      const store = useTranslationAsterixIntegrationStore();

      store.values.serviceAndModalitiesTitleTranslationList = newValue;
      store.$reset();

      expect(store.values.serviceAndModalitiesTitleTranslationList).toStrictEqual(lastSavedValue);
    });
  });
});
