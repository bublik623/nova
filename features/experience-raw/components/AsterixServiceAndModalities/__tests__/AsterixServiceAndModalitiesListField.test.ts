import { config, flushPromises, shallowMount } from "@vue/test-utils";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import { test, expect, describe, vi, beforeEach, Mock } from "vitest";
import AsterixServiceAndModalitiesListField from "../AsterixServiceAndModalitiesListField.vue";
import { setActivePinia } from "pinia";
import { useRawServiceAndModalitiesStore } from "@/features/experience-raw/stores/useRawServiceAndModalitiesStore";

const $tMock = vi.fn((s: string) => s);

vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));

config.global.mocks = {
  $t: $tMock,
};

describe("AsterixServiceAndModalitiesListField", () => {
  let testingPinia: TestingPinia;
  let store: ReturnType<typeof useRawServiceAndModalitiesStore>;

  beforeEach(async () => {
    testingPinia = createTestingPinia();
    setActivePinia(testingPinia);

    store = useRawServiceAndModalitiesStore();
  });

  test("it should init the store with the values from the experienceReferenceCode and value props", async () => {
    const servicesAndModalitiesCodes = [
      { code: "SVC-1", modalities: ["MOD-1"] },
      { code: "SVC-2", modalities: ["MOD-2"] },
      { code: "SVC-3", modalities: ["MOD-3"] },
    ];

    mountComponent({
      experienceReferenceCode: "REF_CODE",
      readonly: false,
      value: servicesAndModalitiesCodes,
    });

    await flushPromises();

    expect(store.initSelectedServicesAndModalities).toHaveBeenCalledWith("REF_CODE", servicesAndModalitiesCodes);
  });

  test("it should render an AsterixServiceAndModalitiesField for each service and modalities entry", async () => {
    const servicesAndModalitiesCodes = [
      { code: "SVC-1", modalities: ["MOD-1"] },
      { code: "SVC-2", modalities: ["MOD-2"] },
      { code: "SVC-3", modalities: ["MOD-3"] },
    ];

    (store.initSelectedServicesAndModalities as Mock).mockImplementationOnce(() => {
      store.selectedServicesAndModalities.push({
        id: "a",
        service: { code: "SVC-1", default_name: "service 1" },
        modalities: [{ code: "MOD-1", default_name: "modality 1" }],
      });
      store.selectedServicesAndModalities.push({
        id: "b",
        service: { code: "SVC-2", default_name: "service 2" },
        modalities: [{ code: "MOD-2", default_name: "modality 2" }],
      });
      store.selectedServicesAndModalities.push({
        id: "c",
        service: { code: "SVC-3", default_name: "service 3" },
        modalities: [{ code: "MOD-3", default_name: "modality 3" }],
      });
    });

    const wrapper = mountComponent({
      readonly: false,
      value: servicesAndModalitiesCodes,
    });

    await flushPromises();

    const individualServiceAndModalitiesComponents = wrapper.findAllComponents({
      name: "AsterixServiceAndModalitiesField",
    });
    expect(individualServiceAndModalitiesComponents.length).toBe(3);
    expect(
      individualServiceAndModalitiesComponents.some((component) => component.props().serviceAndModalitiesId === "a")
    ).toBe(true);
    expect(
      individualServiceAndModalitiesComponents.some((component) => component.props().serviceAndModalitiesId === "b")
    ).toBe(true);
    expect(
      individualServiceAndModalitiesComponents.some((component) => component.props().serviceAndModalitiesId === "c")
    ).toBe(true);
  });

  describe("not read-only", () => {
    test("clicking the Add button should add a new service and modalities entry", async () => {
      const wrapper = mountComponent({
        readonly: false,
        value: [],
      });

      expect(store.addNew).not.toHaveBeenCalled();

      await wrapper.find("[test-id='add-new-service-and-modalities']").trigger("click");

      expect(store.addNew).toHaveBeenCalled();
    });
  });

  describe("read-only", () => {
    test("it should not render the Add button", () => {
      const wrapper = mountComponent({
        readonly: true,
        value: [],
      });

      expect(wrapper.find("[test-id='add-new-service-and-modalities']").exists()).toBe(false);
    });

    test("it should pass the readonly prop to AsterixServiceAndModalitiesField", async () => {
      (store.initSelectedServicesAndModalities as Mock).mockImplementationOnce(() => {
        store.selectedServicesAndModalities.push({
          id: "a",
          service: { code: "SVC-1", default_name: "service 1" },
          modalities: [{ code: "MOD-1", default_name: "modality 1" }],
        });
      });

      const wrapper = mountComponent({
        readonly: true,
        value: [{ code: "SVC-1", modalities: ["MOD-1"] }],
      });

      await flushPromises();

      expect(wrapper.findComponent({ name: "AsterixServiceAndModalitiesField" }).props().readonly).toBe(true);
    });
  });

  function mountComponent(props: any) {
    return shallowMount(AsterixServiceAndModalitiesListField, {
      props,
      global: { plugins: [testingPinia] },
    });
  }
});
