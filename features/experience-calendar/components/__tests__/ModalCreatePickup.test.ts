import { describe, test, expect, vi } from "vitest";
import { mount, config, VueWrapper, MountingOptions } from "@vue/test-utils";
import ModalCreatePickup, { ModalCreatePickupProps } from "../ModalCreatePickup.vue";
import { PickupPlace } from "@/types/generated/PickupPlaceServiceApi";
import { testId, startsWithTestId } from "@/utils/test.utils";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import DocumentFormSection from "@/components/Document/FormSection/FormSection.vue";
import FieldPlaceSearch from "../FieldPlaceSearch.vue";
import { SelectedPlace } from "../FieldPlaceSearch.vue";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));
config.global.mocks = {
  $t: (text: string) => text,
};
config.global.components = {
  DocumentFormSection: DocumentFormSection,
};

const createPickupPlaceMock = vi.fn(() => ({ data: "created-pickup-id" }));
const getPickupPlacesMock = vi.fn(() => ({ data: [] }));
vi.mock("@/features/experience-calendar/api/usePickupPlaceApi", () => ({
  usePickupPlaceApi: vi.fn(() => ({
    createPickupPlace: createPickupPlaceMock,
    getPickupPlaces: getPickupPlacesMock,
  })),
}));

const notificationStoreMock = {
  addNotification: vi.fn(),
  deleteNotification: vi.fn(),
};
vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

const selectedPlaceMock = {
  lat: 41.380896,
  lng: 2.1228198,
  address: "Camp Nou, Carrer d'Arístides Maillol, Barcelona, Spain",
  item: {
    address_components: [
      {
        long_name: "Barcelona",
        short_name: "Barcelona",
        types: ["locality", "political"],
      },
      {
        long_name: "Barcelona",
        short_name: "B",
        types: ["administrative_area_level_2", "political"],
      },
      {
        long_name: "Spain",
        short_name: "ES",
        types: ["country", "political"],
      },
      {
        long_name: "08028",
        short_name: "08028",
        types: ["postal_code"],
      },
    ],
    formatted_address: "C/ d'Arístides Maillol, 12, 08028 Barcelona, Spain",
    geometry: {
      location: {
        lat: 41.380896,
        lng: 2.1228198,
      },
    },
  } as any,
  placeId: "1",
  postalCode: "08028",
} as SelectedPlace;

describe("ModalCreatePickup", () => {
  let wrapper: VueWrapper<InstanceType<typeof ModalCreatePickup>>;

  const render = (options: MountingOptions<ModalCreatePickupProps> = {}) => {
    wrapper = mount(ModalCreatePickup, {
      props: { modelValue: true },
      ...options,
    });
  };

  /**
   * Helper methods for NovaSelect component
   */
  const NovaSelectActions = (wrapper: VueWrapper<any>) => {
    const base = wrapper.find(testId("create-pickup-type"));
    const triggerButton = base.find(testId("select-button"));
    return {
      async selectOption(index: number) {
        await triggerButton.trigger("click");
        const optionList = base.findAll(startsWithTestId("options-list-list-item"));
        await optionList[index].trigger("click");
      },
      label() {
        const selectedLabel = triggerButton.find("#dropdown-label");
        return selectedLabel?.text();
      },
    };
  };

  const findModal = () => wrapper.find(testId("modal-create-pickup"));
  const findCloseButton = () => wrapper.find(testId("create-pickup-modal-close-btn"));
  const findClearAllButton = () => wrapper.find(testId("create-pickup-clear-all"));
  const findAddPickupButton = () => wrapper.find(testId("create-pickup-add-pickup"));
  const findPickupTypeSelect = () => NovaSelectActions(wrapper);
  const findAddressInput = () => wrapper.find<HTMLInputElement>("#create-pickup-address");
  const findNameInput = () => wrapper.find<HTMLInputElement>("#create-pickup-name");

  test("renders the modal", async () => {
    render({ props: { modelValue: false } });

    await wrapper.setProps({ modelValue: true });

    // it should load the data
    expect(getPickupPlacesMock).toHaveBeenCalled();
    expect(findModal().exists()).toBe(true);
  });

  test("closes the modal when the close button is clicked", async () => {
    render();

    findCloseButton().trigger("click");

    expect(wrapper.emitted("click:close")).toBeTruthy();
  });

  test("clears all fields when the clear all button is clicked", async () => {
    render();

    await findNameInput().setValue("hey");
    expect(findNameInput().element.value).toBe("hey");

    // select hotel
    await findPickupTypeSelect().selectOption(0);
    expect(findPickupTypeSelect().label()).toBe("Hotel");

    // select address
    await wrapper.findComponent(FieldPlaceSearch).vm.$emit("select", selectedPlaceMock);
    expect(findAddressInput().element.value).toBe(selectedPlaceMock.address);

    // clear all
    await findClearAllButton().trigger("click");

    // check empty fields
    expect(findNameInput().element.value).toBe("");
    expect(findAddressInput().element.value).toBe("");
    expect(findPickupTypeSelect().label()).toContain("placeholder");
  });

  test("calls createPickupPlace when the add pickup button is clicked", async () => {
    const expectedPickupPlace: PickupPlace = {
      name: "New pickup",
      type: "Hotel",
      supplier_id: "test-supplier-id",
      address: "Camp Nou, Carrer d'Arístides Maillol, Barcelona, Spain",
      city: "Barcelona",
      country: "Spain",
      latitude: "41.380896",
      longitude: "2.1228198",
      status: "ACTIVE",
    };

    render();

    // select hotel
    await findPickupTypeSelect().selectOption(0);

    // name
    await findNameInput().setValue("New pickup");

    // select address
    await wrapper.findComponent(FieldPlaceSearch).vm.$emit("select", selectedPlaceMock);
    expect(findAddressInput().element.value).toBe(selectedPlaceMock.address);

    await findAddPickupButton().trigger("click");

    expect(createPickupPlaceMock).toHaveBeenCalledWith(expectedPickupPlace);
    expect(wrapper.emitted("pickupCreated")).toBeTruthy();
  });
});
