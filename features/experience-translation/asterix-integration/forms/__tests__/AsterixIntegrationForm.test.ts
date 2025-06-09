import { shallowMount } from "@vue/test-utils";
import { vi, beforeEach, describe, expect, it, test } from "vitest";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import AsterixIntegrationForm, { Props } from "../AsterixIntegrationForm.vue";
import { useTranslationAsterixIntegrationStore } from "../../stores/useTranslationAsterixIntegrationStore";
import { setActivePinia } from "pinia";
import { StoreState } from "@/types/Store";

const translationsListFieldFactoryMock = vi.hoisted(() => vi.fn(() => ({ lastSavedValue: [] })));

vi.mock(
  "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/composables/useAsterixServiceAndModalitiesTitleTranslationsListField")
    >()),
    useAsterixServiceAndModalitiesTitleTranslationsListField: translationsListFieldFactoryMock,
  })
);

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const props: Props = {
  readonly: false,
  languageCode: "es",
};

const initialStoreState: Partial<StoreState<typeof useTranslationAsterixIntegrationStore>> = {
  values: {
    serviceAndModalitiesTitleTranslationList: [
      { serviceCode: "SVC-1", title: "svc title", modalities: [{ modalityCode: "MOD-1", title: "mod title" }] },
    ],
  },
};

let testingPinia: TestingPinia;
let store: ReturnType<typeof useTranslationAsterixIntegrationStore>;

describe("AsterixIntegrationForm", () => {
  beforeEach(async () => {
    testingPinia = createTestingPinia({
      initialState: { translationServiceAndModalities: initialStoreState },
      stubActions: true,
    });
    setActivePinia(testingPinia);

    store = useTranslationAsterixIntegrationStore();
  });

  describe("service and modalities titles list field", () => {
    it("should receive the value from the store", async () => {
      const wrapper = mount(props);

      const serviceAndModalitiesTitlesListField = wrapper.getComponent({
        name: "TranslationAsterixServiceAndModalitiesTitleListField",
      });

      expect(serviceAndModalitiesTitlesListField.props()).toMatchObject(
        expect.objectContaining({
          targetValue: store.values.serviceAndModalitiesTitleTranslationList,
        })
      );
    });

    it("should update the store when the value is updated", () => {
      const newValue = [
        {
          serviceCode: "SVC-1",
          title: "svc title edited",
          modalities: [{ modalityCode: "MOD-1", title: "mod title edited" }],
        },
      ];
      const wrapper = mount(props);

      const serviceAndModalitiesTitlesListField = wrapper.getComponent({
        name: "TranslationAsterixServiceAndModalitiesTitleListField",
      });

      serviceAndModalitiesTitlesListField.vm.$emit("update:value", newValue);

      expect(store.updateValues).toHaveBeenCalledWith({ serviceAndModalitiesTitleTranslationList: newValue });
    });

    test.each([true, false])("should receive readonly prop", (readonly) => {
      const wrapper = mount({ ...props, readonly });

      const serviceAndModalitiesTitlesListField = wrapper.getComponent({
        name: "TranslationAsterixServiceAndModalitiesTitleListField",
      });

      expect(serviceAndModalitiesTitlesListField.props()).toMatchObject(expect.objectContaining({ readonly }));
    });
  });
});

function mount(props: Props) {
  return shallowMount(AsterixIntegrationForm, { props, global: { renderStubDefaultSlot: true } });
}
