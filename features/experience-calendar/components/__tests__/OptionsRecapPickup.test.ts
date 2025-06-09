import { mount, config, flushPromises } from "@vue/test-utils";
import OptionsRecapPickup from "../OptionsRecapPickup.vue";
import { describe, expect, test, vi } from "vitest";

const routerMock = {
  push: vi.fn(),
};

const usePickupExperienceApiMock = {
  getPickupsByOptionId: vi.fn().mockResolvedValue({
    data: [
      {
        id: "1",
        pickup_place_ids: ["id1", "id2"],
      },
    ],
  }),
};

const usePickupPlaceApiMock = {
  getPickupPlacesByIds: vi.fn().mockResolvedValue({
    data: [
      {
        id: "id1",
        name: "place1",
        address: "address1",
      },
      {
        id: "id2",
        name: "place2",
        address: "address2",
      },
    ],
  }),
};

config.global.mocks = {
  $t: (s: string) => s,
  $router: routerMock,
};

vi.mock("@/features/experience-calendar/api/usePickupExperienceApi", () => ({
  usePickupExperienceApi: () => usePickupExperienceApiMock,
}));

vi.mock("@/features/experience-calendar/api/usePickupPlaceApi", () => ({
  usePickupPlaceApi: () => usePickupPlaceApiMock,
}));

vi.stubGlobal("useLazyAsyncData", () => {
  return {
    data: {
      value: [
        {
          id: "id1",
          name: "place1",
          address: "address1",
        },
        {
          id: "id2",
          name: "place2",
          address: "address2",
        },
      ],
    },
  };
});

describe("OptionsRecapPickup", () => {
  test("renders pickup places", async () => {
    const wrapper = mount(OptionsRecapPickup, {
      props: {
        optionId: "1",
        pickupPath: "/pickup",
      },
    });

    await flushPromises();

    const headerRows = wrapper.findAll(".PickupRecapTable thead tr");

    expect(headerRows.length).toBe(1);

    const bodyRows = wrapper.findAll(".PickupRecapTable tbody tr");

    expect(bodyRows.length).toBe(2);

    expect(bodyRows[0].text()).toContain("place1");
    expect(bodyRows[0].text()).toContain("address1");
    expect(bodyRows[1].text()).toContain("place2");
    expect(bodyRows[1].text()).toContain("address2");
  });

  test("navigates on edit button click", async () => {
    const wrapper = mount(OptionsRecapPickup, {
      props: {
        optionId: "1",
        pickupPath: "/pickup",
      },
    });

    await flushPromises();

    wrapper.find('[data-testid="pickup-table-reroute"]').trigger("click");

    // Check that route change was triggered
    expect(routerMock.push).toHaveBeenCalledWith("/pickup");
  });

  describe("if is readonly", async () => {
    test("it should show the edit buttons", async () => {
      const wrapper = mount(OptionsRecapPickup, {
        props: {
          optionId: "1",
          pickupPath: "/pickup",
          readonly: true,
        },
      });

      expect(wrapper.find('[data-testid="pickup-table-reroute"]').isVisible()).toBeTruthy();
    });
  });
});
