import { config, flushPromises } from "@vue/test-utils";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import { test, expect, describe, vi, beforeEach, Mock } from "vitest";
import AsterixModalitiesSelectInput from "../AsterixModalitiesSelectInput.vue";
import { setActivePinia } from "pinia";
import {
  ServiceAndRelatedModalities,
  useRawServiceAndModalitiesStore,
} from "@/features/experience-raw/stores/useRawServiceAndModalitiesStore";
import { AsxExperience, ModalityCodes } from "@/types/generated/ExperienceRawServiceApi";
import { createLazyAsyncDataMock } from "../../../../testing/utils/useLazyAsyncDataMock";
import { mountWithSuspense } from "../../../../testing/utils/mountWithSuspense.js";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import NovaSelectSearch from "../../../../../ui-kit/NovaSelectSearch/NovaSelectSearch.vue";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

const $tMock = vi.fn((s: string) => s);

vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));

config.global.mocks = {
  $t: $tMock,
};

vi.mock("lodash", async () => {
  return {
    debounce: (fn: any) => fn,
  };
});

const useLazyAsyncDataMock = createLazyAsyncDataMock<Array<ModalityCodes>>();
vi.stubGlobal("useLazyAsyncData", useLazyAsyncDataMock);

describe("AsterixModalitiesSelectInput", () => {
  const serviceAndModalitiesId = "xyz";
  const availableModalities = [
    { code: "ASX-MOD-1", default_name: "Asterix Modality 1", experience_id: "ASX-SVC-1" },
    { code: "ASX-MOD-2", default_name: "Asterix Modality 2", experience_id: "ASX-SVC-1" },
  ];
  const availableOptions = [
    { label: "ASX-MOD-1 - Asterix Modality 1", value: availableModalities[0] },
    { label: "ASX-MOD-2 - Asterix Modality 2", value: availableModalities[1] },
  ];
  const services = [
    {
      code: "ASX-SVC-1",
      default_name: "Asterix Service 1",
    },
    {
      code: "ASX-SVC-2",
      default_name: "Asterix Service 2",
    },
  ];
  const initialStoreState: { selectedServicesAndModalities: Array<ServiceAndRelatedModalities> } = {
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

  test("it should search the available modalities when the service for its given entry is set for the first time", async () => {
    (store.getAvailableModalities as Mock<() => Promise<Array<ModalityCodes>>>).mockReturnValueOnce(
      Promise.resolve(availableModalities)
    );

    const wrapper = await mountComponent({ serviceAndModalitiesId });

    const novaSelectComponent = wrapper.findComponent(NovaSelectSearch);

    expect(store.getAvailableModalities).not.toHaveBeenCalled();

    await setSelectedService(services[0]);

    expect(store.getAvailableModalities).toHaveBeenCalledWith(serviceAndModalitiesId, "");
    expect(novaSelectComponent.props().options).toEqual(availableOptions);
  });

  test("it should search the available modalities when the service for its given entry change", async () => {
    (store.getAvailableModalities as Mock<() => Promise<Array<ModalityCodes>>>).mockReturnValueOnce(
      Promise.resolve(availableModalities)
    );

    await setSelectedService(services[0]);

    const wrapper = await mountComponent({ serviceAndModalitiesId });

    const novaSelectComponent = wrapper.findComponent(NovaSelectSearch);

    expect(store.getAvailableModalities).not.toHaveBeenCalled();

    await setSelectedService(services[1]);

    expect(store.getAvailableModalities).toHaveBeenCalledWith(serviceAndModalitiesId, "");
    expect(novaSelectComponent.props().options).toEqual(availableOptions);
  });

  test("it should search the available modalities when the query change", async () => {
    (store.getAvailableModalities as Mock<() => Promise<Array<ModalityCodes>>>).mockReturnValueOnce(
      Promise.resolve(availableModalities)
    );
    (store.getAvailableModalities as Mock<() => Promise<Array<ModalityCodes>>>).mockReturnValueOnce(
      Promise.resolve([availableModalities[1]])
    );

    const wrapper = await mountComponent({ serviceAndModalitiesId });

    const novaSelectComponent = wrapper.findComponent(NovaSelectSearch);

    await novaSelectComponent.vm.$emit("update:searchQuery", "a query");

    expect(store.getAvailableModalities).not.toHaveBeenCalled();

    await setSelectedService(services[0]);

    expect(store.getAvailableModalities).toHaveBeenCalledWith(serviceAndModalitiesId, "a query");
    expect(novaSelectComponent.props().options).toEqual(availableOptions);

    await novaSelectComponent.vm.$emit("update:searchQuery", "a new query");
    await awaitDebounce();

    expect(store.getAvailableModalities).toHaveBeenCalledWith(serviceAndModalitiesId, "a new query");
    expect(novaSelectComponent.props().options).toEqual([availableOptions[1]]);
  });

  test("when an option is selected, it should toggle the selection status of the related modality", async () => {
    (store.getAvailableModalities as Mock<() => Promise<Array<ModalityCodes>>>).mockReturnValueOnce(
      Promise.resolve(availableModalities)
    );

    const wrapper = await mountComponent({ serviceAndModalitiesId });

    const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });

    expect(store.toggleModalitySelection).not.toHaveBeenCalled();

    await novaSelectComponent.vm.$emit("select:option", availableOptions[0]);
    await flushPromises();

    expect(store.toggleModalitySelection).toHaveBeenCalledWith(serviceAndModalitiesId, availableOptions[0].value);

    await novaSelectComponent.vm.$emit("select:option", availableOptions[1]);
    await flushPromises();

    expect(store.toggleModalitySelection).toHaveBeenCalledWith(serviceAndModalitiesId, availableOptions[1].value);
  });

  test("it should pass the selected modalities to the NovaSelectSearch as options", async () => {
    const wrapper = await mountComponent({ serviceAndModalitiesId });

    const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });

    expect(novaSelectComponent.props().selected).toStrictEqual([]);

    await setSelectedModalities([availableModalities[0]]);

    expect(novaSelectComponent.props().selected).toStrictEqual([availableOptions[0]]);

    await setSelectedModalities([availableModalities[0], availableModalities[1]]);

    expect(novaSelectComponent.props().selected).toStrictEqual([availableOptions[0], availableOptions[1]]);
  });

  async function mountComponent(props: object) {
    return await mountWithSuspense(AsterixModalitiesSelectInput, props, { global: { plugins: [testingPinia] } });
  }

  async function setSelectedService(service: AsxExperience) {
    store.selectedServicesAndModalities[0].service = service;
    await awaitDebounce();
  }

  async function setSelectedModalities(modalities: Array<ModalityCodes>) {
    store.selectedServicesAndModalities[0].modalities = modalities;
    await flushPromises();
  }

  async function awaitDebounce(delay: number = 10) {
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
});
