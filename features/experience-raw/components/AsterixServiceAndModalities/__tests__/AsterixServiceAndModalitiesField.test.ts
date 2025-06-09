import { config, shallowMount } from "@vue/test-utils";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import { test, expect, describe, vi, beforeEach, Mock } from "vitest";
import AsterixServiceAndModalitiesField from "../AsterixServiceAndModalitiesField.vue";
import { setActivePinia } from "pinia";
import { useRawServiceAndModalitiesStore } from "@/features/experience-raw/stores/useRawServiceAndModalitiesStore";

const $tMock = vi.fn((s: string) => s);

vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));

config.global.mocks = {
  $t: $tMock,
};

describe("AsterixServiceAndModalitiesField", () => {
  const serviceAndModalitiesId = "xyz";
  const initialStoreState = {
    selectedServicesAndModalities: [
      {
        id: serviceAndModalitiesId,
        service: undefined,
        modalities: [],
      },
    ],
  };
  let testingPinia: TestingPinia;
  let store: ReturnType<typeof useRawServiceAndModalitiesStore>;

  beforeEach(async () => {
    testingPinia = createTestingPinia({ initialState: { rawServiceAndModalities: initialStoreState } });
    setActivePinia(testingPinia);

    store = useRawServiceAndModalitiesStore();
  });

  describe("not read-only", () => {
    test("clicking the delete button should remove the service and modalities entry", async () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

      await wrapper.find("[data-testid='delete-service-and-modalities']").trigger("click");

      expect(store.remove).toHaveBeenCalledWith(serviceAndModalitiesId);
    });
  });

  describe("some selected modalities", () => {
    beforeEach(() => {
      (store.hasAnySelectedModality as Mock<(id: string) => boolean>).mockReturnValueOnce(true);
    });

    test("it should render the AsterixModalitiesList", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

      expect(wrapper.findComponent({ name: "AsterixModalitiesList" }).exists()).toBe(true);
    });
  });

  describe("no selected modalities", () => {
    beforeEach(() => {
      (store.hasAnySelectedModality as Mock<(id: string) => boolean>).mockReturnValueOnce(false);
    });

    test("it should not render the AsterixModalitiesList", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

      expect(wrapper.findComponent({ name: "AsterixModalitiesList" }).exists()).toBe(false);
    });
  });

  describe("read-only", () => {
    test("it should pass the readonly prop to AsterixServiceSelectInput", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.findComponent({ name: "AsterixServiceSelectInput" }).props().readonly).toBe(true);
    });

    test("it should not render AsterixModalitiesSelectInput", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.findComponent({ name: "AsterixModalitiesSelectInput" }).exists()).toBe(false);
    });

    test("it should pass the readonly prop to AsterixModalitiesList", () => {
      (store.hasAnySelectedModality as Mock<(id: string) => boolean>).mockReturnValueOnce(true);

      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.findComponent({ name: "AsterixModalitiesList" }).props().readonly).toBe(true);
    });

    test("it should not render the delete button", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.find("[data-testid='delete-service-and-modalities']").exists()).toBe(false);
    });
  });

  function mountComponent(props: Object) {
    return shallowMount(AsterixServiceAndModalitiesField, {
      props,
      global: { plugins: [testingPinia] },
    });
  }
});
