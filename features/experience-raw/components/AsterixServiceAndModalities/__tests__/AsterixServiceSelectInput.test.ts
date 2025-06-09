import { config, flushPromises } from "@vue/test-utils";
import { TestingPinia, createTestingPinia } from "@pinia/testing";
import { test, expect, describe, vi, beforeEach, Mock } from "vitest";
import AsterixServiceSelectInput from "../AsterixServiceSelectInput.vue";
import { setActivePinia } from "pinia";
import {
  AvailableService,
  ServiceAndRelatedModalities,
  useRawServiceAndModalitiesStore,
} from "@/features/experience-raw/stores/useRawServiceAndModalitiesStore";
import { AsxExperience } from "@/types/generated/ExperienceRawServiceApi";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { createLazyAsyncDataMock } from "../../../../testing/utils/useLazyAsyncDataMock";
import { mountWithSuspense } from "../../../../testing/utils/mountWithSuspense.js";
import { NovaSelectSearchOptionItem } from "@/ui-kit/NovaSelectSearch/NovaSelectSearchOption.vue";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

const $tMock = vi.fn((s: string) => s);

vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));

config.global.mocks = {
  $t: $tMock,
};

const useLazyAsyncDataMock = createLazyAsyncDataMock<Array<AsxExperience>>();
vi.stubGlobal("useLazyAsyncData", useLazyAsyncDataMock);

describe("AsterixServiceSelectInput", () => {
  const serviceAndModalitiesId = "xyz";
  function getAvailableServices(): Array<AvailableService> {
    return [
      { code: "ASX-SVC-1", default_name: "Asterix Service 1", can_be_selected: true },
      { code: "ASX-SVC-2", default_name: "Asterix Service 2", can_be_selected: true },
    ];
  }
  function getAvailableOptions(
    availableServices: Array<AvailableService>
  ): Array<NovaSelectSearchOptionItem<AvailableService>> {
    return [
      { label: "ASX-SVC-1 - Asterix Service 1", value: availableServices[0], disabled: false, badge: undefined },
      { label: "ASX-SVC-2 - Asterix Service 2", value: availableServices[1], disabled: false, badge: undefined },
    ];
  }
  function getInitialStoreState(): { selectedServicesAndModalities: Array<ServiceAndRelatedModalities> } {
    return {
      selectedServicesAndModalities: [
        {
          id: serviceAndModalitiesId,
          service: undefined,
          modalities: [],
        },
      ],
    };
  }
  let testingPinia: TestingPinia;
  let store: ReturnType<typeof useRawServiceAndModalitiesStore>;

  beforeEach(async () => {
    testingPinia = createTestingPinia({
      stubActions: false,
      initialState: { rawServiceAndModalities: getInitialStoreState() },
    });
    setActivePinia(testingPinia);

    store = useRawServiceAndModalitiesStore();
  });

  describe("not read-only", () => {
    test("it should load the available services when it's rendered", async () => {
      const availableServices = getAvailableServices();
      (store.getAvailableServices as Mock<() => Promise<Array<AvailableService>>>).mockReturnValueOnce(
        Promise.resolve(availableServices)
      );

      await mountComponent({ serviceAndModalitiesId, readonly: false });

      expect(store.getAvailableServices).toHaveBeenCalledWith(serviceAndModalitiesId, "");
    });

    test("it should search the available services when the query change", async () => {
      const availableServices = getAvailableServices();
      (store.getAvailableServices as Mock<() => Promise<Array<AvailableService>>>).mockReturnValue(
        Promise.resolve(availableServices)
      );

      const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: false });

      const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });
      await novaSelectComponent.vm.$emit("update:searchQuery", "a query");
      await awaitDebounce();

      expect(store.getAvailableServices).toHaveBeenCalledWith(serviceAndModalitiesId, "a query");

      await novaSelectComponent.vm.$emit("update:searchQuery", "a new query");
      await awaitDebounce();

      expect(store.getAvailableServices).toHaveBeenCalledWith(serviceAndModalitiesId, "a new query");
    });

    test("it should set the selected service in the store when the user select a service in the select component", async () => {
      const availableServices = getAvailableServices();
      (store.getAvailableServices as Mock<() => Promise<Array<AvailableService>>>).mockReturnValueOnce(
        Promise.resolve(availableServices)
      );
      const availableOptions = getAvailableOptions(availableServices);

      const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: false });

      const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });

      expect(store.setSelectedService).not.toHaveBeenCalled();

      await novaSelectComponent.vm.$emit("select:option", availableOptions[0]);
      await flushPromises();

      expect(store.setSelectedService).toHaveBeenCalledWith(serviceAndModalitiesId, availableOptions[0].value);
    });

    test("it should pass the selected service to the NovaSelectSearch as selected option", async () => {
      const availableServices = getAvailableServices();
      const selectedService = availableServices[0];
      const expectedSelectedOptions = [
        { label: `${selectedService.code} - ${selectedService.default_name}`, value: selectedService },
      ];
      const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: false });

      const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });

      expect(novaSelectComponent.props().selected).toStrictEqual([]);

      store.selectedServicesAndModalities[0].service = selectedService;
      await flushPromises();

      expect(novaSelectComponent.props().selected).toStrictEqual(expectedSelectedOptions);
    });

    test("it should create a disabled option with badge information for services that can't be selected", async () => {
      const availableServices = getAvailableServices();
      availableServices[0].can_be_selected = false;
      availableServices[0].reference_code = "AN EXPERIENCE REF CODE";

      const options = getAvailableOptions(availableServices);
      options[0].disabled = true;
      options[0].badge = { text: `Connected to ${availableServices[0].reference_code}`, theme: "middle-grey" };

      (store.getAvailableServices as Mock<() => Promise<Array<AvailableService>>>).mockReturnValueOnce(
        Promise.resolve(availableServices)
      );

      const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: false });
      const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });

      expect(novaSelectComponent.props().options).toStrictEqual(options);
    });

    describe("options rendering", () => {
      test("it should render options with NovaSelectSearchOption", async () => {
        const availableServices = getAvailableServices();
        (store.getAvailableServices as Mock<() => Promise<Array<AvailableService>>>).mockReturnValueOnce(
          Promise.resolve(availableServices)
        );

        const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: false });
        const novaSelectComponent = wrapper.findComponent({ name: "NovaSelectSearch" });

        const trigger = novaSelectComponent.find("div.SelectSearch");

        await trigger.trigger("click");
        await flushPromises();

        const novaOptionsList = novaSelectComponent.findComponent({ name: "NovaOptionsList" });
        const listItems = novaOptionsList.findAll("li");

        expect(listItems).toBeDefined();
        expect(listItems.length).toBe(availableServices.length);
        listItems.forEach((listItem) => {
          expect(listItem.findComponent({ name: "NovaSelectSearchOption" }).exists()).toBe(true);
        });
      });
    });

    test("it should refresh the available services list when a service is selected", async () => {
      const availableServices = getAvailableServices();
      store.selectedServicesAndModalities.push({ id: "A NEW ID", service: undefined, modalities: [] });

      await mountComponent({ serviceAndModalitiesId, readonly: false });

      expect(store.getAvailableServices).toHaveBeenCalledOnce();

      store.setSelectedService("A NEW ID", availableServices[0]);

      await flushPromises();

      expect(store.getAvailableServices).toHaveBeenCalledTimes(2);
    });

    test("it should refresh the available services list when an entry is removed", async () => {
      store.selectedServicesAndModalities.push({ id: "A NEW ID", service: undefined, modalities: [] });

      await mountComponent({ serviceAndModalitiesId, readonly: false });

      expect(store.getAvailableServices).toHaveBeenCalledOnce();

      store.remove("A NEW ID");

      await flushPromises();

      expect(store.getAvailableServices).toHaveBeenCalledTimes(2);
    });
  });

  describe("read-only", () => {
    test("it should display the name of the selected service", async () => {
      const availableServices = getAvailableServices();
      (store.getSelectedServiceOrThrowError as Mock<() => ServiceAndRelatedModalities>).mockReturnValueOnce({
        ...store.selectedServicesAndModalities[0],
        service: availableServices[0],
      });

      const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.find("[data-testid='selected-service-name']").text()).toBe("Asterix Service 1");
    });

    test("it should not use NovaSelectSearch", async () => {
      (store.getSelectedServiceOrThrowError as Mock<() => ServiceAndRelatedModalities>).mockReturnValueOnce(
        store.selectedServicesAndModalities[0]
      );

      const wrapper = await mountComponent({ serviceAndModalitiesId, readonly: true });

      expect(wrapper.findComponent({ name: "NovaSelectSearch" }).exists()).toBe(false);
    });
  });

  async function mountComponent(props: object) {
    return await mountWithSuspense(AsterixServiceSelectInput, props, { global: { plugins: [testingPinia] } });
  }

  async function awaitDebounce(delay: number = 10) {
    await flushPromises();

    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }
});
