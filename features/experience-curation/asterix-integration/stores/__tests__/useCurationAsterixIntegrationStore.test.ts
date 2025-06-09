import { vi, describe, test, beforeEach, expect } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCurationAsterixIntegrationStore } from "../useCurationAsterixIntegrationStore";
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
const lastSavedValue: ServiceAndModalitiesTitleListValue = [
  { serviceCode: "SVC-1", title: "svc title", modalities: [{ modalityCode: "MOD-1", title: "mod title " }] },
];

describe("useCurationAsterixIntegrationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    useRouteMock.mockReturnValueOnce({ params: { id: experienceId } });
  });

  test("initialize title translations list field value from its last saved value", () => {
    translationsListFieldFactoryMock.mockImplementation((expId: Ref<string>, languageCode: Ref<AvailableLanguage>) => {
      if (expId.value !== experienceId) {
        throw "experience id does not match with expected";
      }
      if (languageCode.value !== "en") {
        throw "language code does not match with expected";
      }
      return { lastSavedValue: ref(lastSavedValue) };
    });

    const store = useCurationAsterixIntegrationStore();

    expect(store.values.serviceAndModalitiesTitleTranslationList).toStrictEqual(lastSavedValue);
  });

  describe("save", () => {
    const saveMock = vi.fn();
    beforeEach(() => {
      translationsListFieldFactoryMock.mockReturnValue({ lastSavedValue, save: saveMock });
    });

    test("it should not save title translations list field value if it isn't updated", async () => {
      const store = useCurationAsterixIntegrationStore();

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

      const store = useCurationAsterixIntegrationStore();

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

      const store = useCurationAsterixIntegrationStore();

      store.values.serviceAndModalitiesTitleTranslationList = newValue;
      store.$reset();

      expect(store.values.serviceAndModalitiesTitleTranslationList).toStrictEqual(lastSavedValue);
    });
  });
});
