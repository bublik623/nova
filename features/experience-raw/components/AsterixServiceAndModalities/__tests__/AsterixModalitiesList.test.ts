import { mount, config } from "@vue/test-utils";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import { test, expect, describe, vi, beforeEach } from "vitest";
import AsterixModalitiesList from "../AsterixModalitiesList.vue";
import { setActivePinia } from "pinia";
import { useRawServiceAndModalitiesStore } from "@/features/experience-raw/stores/useRawServiceAndModalitiesStore";

const $tMock = vi.fn((s: string) => s);

vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));

config.global.mocks = {
  $t: $tMock,
};

describe("AsterixModalitiesList", () => {
  const serviceAndModalitiesId = "xyz";
  const initialStoreState = {
    selectedServicesAndModalities: [
      {
        id: serviceAndModalitiesId,
        service: { code: "ASX-SVC-1", default_name: "Asterix Service 1" },
        modalities: [
          { code: "ASX-MOD-1", experienceId: "ASX-SVC-1", default_name: "Asterix Modality 1 (Service 1)" },
          { code: "ASX-MOD-2", experienceId: "ASX-SVC-1", default_name: "Asterix Modality 2 (Service 1)" },
        ],
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

  test("it should show the number of selected modalities", () => {
    const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

    expect(wrapper.find("[test-id='selected-modalities-count']").text()).toBe("2 common.selected");
  });

  test("it should display one list-element for each selected modality", async () => {
    const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

    const listElements = wrapper.findAll("li.list-element");

    expect(listElements.length).toBe(2);
    expect(listElements[0].text()).toBe("ASX-MOD-1 - Asterix Modality 1 (Service 1)");
    expect(listElements[1].text()).toBe("ASX-MOD-2 - Asterix Modality 2 (Service 1)");
  });

  describe("not read-only", () => {
    test("clicking the clear all button should remove all modalities from the selected modalities related with that entry", async () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

      await wrapper.find("[test-id='clear-all']").trigger("click");

      expect(store.removeAllModalities).toHaveBeenCalledWith(serviceAndModalitiesId);
    });

    test("it should display a remove single modality button per each selected modality", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

      expect(wrapper.findAll("[test-id^='remove-modality-']").length).toBe(2);
    });

    test("clicking the remove single modality button should remove that modality from the selected modalities", async () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: false });

      await wrapper.find("[test-id='remove-modality-ASX-MOD-2']").trigger("click");

      expect(store.removeModality).toHaveBeenCalledWith(
        serviceAndModalitiesId,
        initialStoreState.selectedServicesAndModalities[0].modalities[1]
      );
    });
  });

  describe("read-only", () => {
    test("it should not display the clear all button", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.find("[test-id='clear-all']").exists()).toBe(false);
    });

    test("it should not display the remove single modality button", () => {
      const wrapper = mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.findAll("[test-id^='remove-modality-']").length).toBe(0);
    });
  });

  function mountComponent(props: Object) {
    return mount(AsterixModalitiesList, {
      props,
      global: { plugins: [testingPinia] },
    });
  }
});
