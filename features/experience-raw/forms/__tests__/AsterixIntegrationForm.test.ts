import { config, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import AsterixIntegrationForm from "../AsterixIntegrationForm.vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { setActivePinia } from "pinia";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import { RawAsterixAdapterInformation } from "@/types/generated/ExperienceRawServiceApi";
import { cloneDeep } from "lodash";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
};

const distributionData = { reference_code: "REF CODE" };

const useNuxtDataMock = vi.fn<<T>(key: string) => { data: Ref<T> }>();
vi.stubGlobal("useNuxtData", useNuxtDataMock);

const saveRawContentMock = vi.hoisted(() => vi.fn(() => Promise.resolve(undefined)));
vi.mock("@/features/experience-raw/lib/saveRawContent", () => ({
  saveRawContent: saveRawContentMock,
}));

let testingPinia: TestingPinia;

const asterixServicesAndModalitiesCodes: RawAsterixAdapterInformation[] = [
  { code: "SVC-1", modality_codes: ["MOD-1", "MOD-2"] },
  { code: "SVC-2", modality_codes: ["MOD-3", "MOD-4"] },
];
const experienceId = "exp-id";
const experience = {
  data: {
    legacy_adapter_information: {
      asx_codes: asterixServicesAndModalitiesCodes,
    },
  },
  fields: {
    asterix_service_and_modalities_codes: {
      value: asterixServicesAndModalitiesCodes,
    },
  },
};

describe("AsterixIntegrationForm", () => {
  beforeEach(() => {
    useNuxtDataMock.mockImplementationOnce(() => ({ data: ref(distributionData) }));
    testingPinia = createTestingPinia({
      initialState: { "experience-raw": { rawContents: { [experienceId]: cloneDeep(experience) } } },
    });
    setActivePinia(testingPinia);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("It should include the Asterix Service and Modalities form section", () => {
    const wrapper = mount(AsterixIntegrationForm, {
      props: { experienceId, readonly: false },
      global: { plugins: [testingPinia] },
    });

    const formSectionWrapper = wrapper.findComponent({ name: "FormSection" });

    expect(formSectionWrapper.exists()).toBe(true);
    expect(formSectionWrapper.props()).toMatchObject({
      id: "raw.asterix-integration.service-and-modalities-codes",
      required: true,
    });
  });

  describe("Interaction with the Asterix Service and Modalities List Field Component", () => {
    test.each([true, false])("It should forward the readonly prop", async (readonly: boolean) => {
      const wrapper = mount(AsterixIntegrationForm, {
        props: { experienceId, readonly },
        global: { plugins: [testingPinia] },
      });

      const listFieldWrapper = wrapper.findComponent({ name: "AsterixServiceAndModalitiesListField" });

      expect(listFieldWrapper.exists()).toBe(true);
      expect(listFieldWrapper.props()).toMatchObject({ readonly });
    });

    test("It should pass the value of the the experience's asterix_service_and_modalities_codes field", async () => {
      const wrapper = mount(AsterixIntegrationForm, {
        props: { experienceId, readonly: false },
        global: { plugins: [testingPinia] },
      });

      const listFieldWrapper = wrapper.findComponent({ name: "AsterixServiceAndModalitiesListField" });

      expect(listFieldWrapper.exists()).toBe(true);
      expect(listFieldWrapper.props()).toMatchObject({
        readonly: false,
        value: asterixServicesAndModalitiesCodes,
      });
    });

    test("It should pass the reference code of the current experience", async () => {
      const wrapper = mount(AsterixIntegrationForm, {
        props: { experienceId, readonly: false },
        global: { plugins: [testingPinia] },
      });

      const listFieldWrapper = wrapper.findComponent({ name: "AsterixServiceAndModalitiesListField" });

      expect(useNuxtDataMock).toHaveBeenCalledWith(`getDistributionContent-${experienceId}`);
      expect(listFieldWrapper.exists()).toBe(true);
      expect(listFieldWrapper.props()).toMatchObject({
        experienceReferenceCode: distributionData.reference_code,
      });
    });

    test("It should update experience's asterix_service_and_modalities_codes field value when the value is updated", async () => {
      const updatedValue = [...asterixServicesAndModalitiesCodes, { code: "SVC-3", modality_codes: ["MOD-5"] }];
      const wrapper = mount(AsterixIntegrationForm, {
        props: { experienceId, readonly: false },
        global: { plugins: [testingPinia] },
      });

      const listFieldWrapper = wrapper.findComponent({ name: "AsterixServiceAndModalitiesListField" });

      listFieldWrapper.vm.$emit("update:value", updatedValue);

      const store = useExperienceRaw();
      expect(store.rawContents[experienceId].fields.asterix_service_and_modalities_codes!.value).toStrictEqual(
        updatedValue
      );
    });
  });

  test("It should emit hasUnsavedChanges event when the field value changes in the experience", async () => {
    const updatedValue = [...asterixServicesAndModalitiesCodes, { code: "SVC-3", modality_codes: ["MOD-5"] }];
    const wrapper = mount(AsterixIntegrationForm, {
      props: { experienceId, readonly: false },
      global: { plugins: [testingPinia] },
    });

    const store = useExperienceRaw();
    store.rawContents[experienceId].fields.asterix_service_and_modalities_codes!.value = updatedValue;

    await flushPromises();

    expect(wrapper.emitted()["hasUnsavedChanges"][0]).toStrictEqual([true]);
  });
});
