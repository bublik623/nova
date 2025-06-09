import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import ResultTableRow, { Props } from "../ResultTableRow.vue";
import { CapacityType, PricingDefinition } from "@/types/Options";

config.global.mocks = {
  $t: (text: string) => text,
};
const capacityType: Ref<CapacityType> = ref(CapacityType.SHARED);
const multilanguage: Ref<boolean> = ref(true);
const enabled: Ref<boolean> = ref(true);

const props: Props = {
  checked: false,
  timeSliceSlot: {
    id: "5ca578df-20f5-3c3e-b414-e973ba135cd2",
    experience_id: "ab31c6f3-d335-4de0-bf94-4fca938173ea",
    timeslice_id: "591ddc51-9fe4-3b54-9300-64cd1f89b913",
    aggregation_id: "be2ed909-c7ad-3a6c-bb07-ef903bb47951",
    language: "en",
    type: "NO-CALENDAR-FIXED-END",
    confirmation_time: "P0Y0M0DT0H0M0S",
    cutoff_time: "P0Y0M0DT0H0M0S",
    supplier: "c2b1e5d0-04f2-46f1-b74b-4f9a5c75d7f9",
    option: {
      id: "59b7f2b1-ac4f-40b0-b531-e0e4ac921ba6",
      name: "open - language",
      multilanguage: multilanguage,
      capacity_type: capacityType,
      pricing_type_allowed: "person",
    },
    pricing: {
      id: "284cc8ca-c8c9-4559-9fc9-aacc628657ca",
      name: "pricing",
      holder: "adult",
      age_range: {
        from: 18,
        to: 64,
      },
      pricing_type: "person",
      tiers: [
        {
          from: 1,
          to: 15,
          retail_price: 10,
          commission: 50,
          net_price: 5,
        },
      ],
      currency: "EUR",
    },
    total_capacity: 12,
    remaining_capacity: 12,
    date: "",
    bookings: 0,
    expiration_date: "2023-04-14",
    enabled: enabled.value,
    name: "lang",
    status: "ACTIVE",
    aggregationSlots: [
      {
        id: "263183c2-ed55-3e43-a4d9-8b61a8822331",
        experience_id: "ab31c6f3-d335-4de0-bf94-4fca938173ea",
        timeslice_id: "591ddc51-9fe4-3b54-9300-64cd1f89b913",
        aggregation_id: "94246976-b4cf-30cb-a7de-88103dbb0a35",
        language: "it",
        type: "NO-CALENDAR-FIXED-END",
        confirmation_time: "P0Y0M0DT0H0M0S",
        cutoff_time: "P0Y0M0DT0H0M0S",
        date: "",
        supplier: "c2b1e5d0-04f2-46f1-b74b-4f9a5c75d7f9",
        option: {
          id: "59b7f2b1-ac4f-40b0-b531-e0e4ac921ba6",
          name: "open - language",
          multilanguage: multilanguage,
          capacity_type: capacityType,
          pricing_type_allowed: "person",
        },
        pricing: {
          id: "284cc8ca-c8c9-4559-9fc9-aacc628657ca",
          name: "pricing",
          holder: "adult",
          age_range: {
            from: 18,
            to: 64,
          },
          pricing_type: "person",
          tiers: [
            {
              from: 1,
              to: 15,
              retail_price: 10,
              commission: 50,
              net_price: 5,
            },
          ],
          currency: "EUR",
        },
        total_capacity: 12,
        remaining_capacity: 12,
        bookings: 0,
        expiration_date: "2023-04-14",
        enabled: enabled.value,
        name: "lang",
        status: "ACTIVE",
      },
      {
        id: "5ca578df-20f5-3c3e-b414-e973ba135cd2",
        experience_id: "ab31c6f3-d335-4de0-bf94-4fca938173ea",
        timeslice_id: "591ddc51-9fe4-3b54-9300-64cd1f89b913",
        aggregation_id: "be2ed909-c7ad-3a6c-bb07-ef903bb47951",
        language: "en",
        type: "NO-CALENDAR-FIXED-END",
        confirmation_time: "P0Y0M0DT0H0M0S",
        cutoff_time: "P0Y0M0DT0H0M0S",
        supplier: "c2b1e5d0-04f2-46f1-b74b-4f9a5c75d7f9",
        option: {
          id: "59b7f2b1-ac4f-40b0-b531-e0e4ac921ba6",
          name: "open - language",
          multilanguage: multilanguage,
          capacity_type: capacityType,
          pricing_type_allowed: "person",
        },
        pricing: {
          id: "284cc8ca-c8c9-4559-9fc9-aacc628657ca",
          name: "pricing",
          holder: "adult",
          age_range: {
            from: 18,
            to: 64,
          },
          pricing_type: "person",
          tiers: [
            {
              from: 1,
              to: 15,
              retail_price: 10,
              commission: 50,
              net_price: 5,
            },
          ],
          currency: "EUR",
        },
        total_capacity: 12,
        remaining_capacity: 12,
        date: "",
        bookings: 0,
        expiration_date: "2023-04-14",
        enabled: enabled.value,
        name: "lang",
        status: "ACTIVE",
      },
    ],
  },
  onUpdateCapacity: vi.fn(),
  gridTemplate: "repeat(7, auto)",
};

const selectors = {
  rowTime: "[data-testid='resultrow-time']",
  rowOptionName: "[data-testid='resultrow-option-name']",
  rowBookings: "[data-testid='resultrow-bookings']",
  rowAvailabilities: "[data-testid='resultrow-availabilities']",
  rowTotal: "[data-testid='resultrow-total']",
  rowActions: "[data-testid='resultrow-actions']",
  rowStatus: "[data-testid='resultrow-status']",
  subRowLabel: "[data-testid='resultsubrow-label']",
  subRowBookings: "[data-testid='resultsubrow-bookings']",
  subRowAvailabilities: "[data-testid='resultsubrow-availabilities']",
  subRowTotal: "[data-testid='resultsubrow-total']",
  toggleButton: ".ResultTableRow__icon",
};

describe("FilterDateSingle", () => {
  test("it should render correctly", () => {
    const wrapper = mount(ResultTableRow, { props });

    expect(wrapper.find(selectors.rowOptionName).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.rowBookings).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.rowAvailabilities).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.rowTotal).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.rowStatus).isVisible()).toBeTruthy();
    expect(wrapper.find("[data-testid='resultsubrow-label-group']").exists()).toBeFalsy();
  });

  describe("if the user click on the toggle button", () => {
    test("it should show the subRoute", async () => {
      const wrapper = mount(ResultTableRow, { props });

      expect(wrapper.find(selectors.subRowAvailabilities).isVisible()).toBeFalsy();
      expect(wrapper.find(selectors.subRowBookings).isVisible()).toBeFalsy();
      expect(wrapper.find(selectors.subRowLabel).isVisible()).toBeFalsy();
      expect(wrapper.find(selectors.subRowTotal).isVisible()).toBeFalsy();

      await wrapper.find(selectors.toggleButton).trigger("click");

      expect(wrapper.find(selectors.subRowAvailabilities).isVisible()).toBeTruthy();
      expect(wrapper.find(selectors.subRowBookings).isVisible()).toBeTruthy();
      expect(wrapper.find(selectors.subRowLabel).isVisible()).toBeTruthy();
      expect(wrapper.find(selectors.subRowTotal).isVisible()).toBeTruthy();
      expect(wrapper.find(selectors.rowStatus).isVisible()).toBeTruthy();
    });
  });

  describe("if the capacity type is language", () => {
    test.skip("it should show all the fields filled in the main row and only the booked in the sub row", () => {
      const wrapper = mount(ResultTableRow, { props });

      // row
      expect(wrapper.find(selectors.rowAvailabilities).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowOptionName).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowTotal).text().length).toBeTruthy();

      // since the time is undefined it should not display the start time column
      expect(wrapper.find(selectors.rowTime).exists()).toBeFalsy();

      // sub row
      expect(wrapper.find(selectors.subRowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.subRowTotal).text().length).toBeFalsy();
      expect(wrapper.find(selectors.subRowAvailabilities).text().length).toBeFalsy();

      // the subrow label should be the language
      expect(wrapper.findAll(selectors.subRowLabel)[0].text()).toBe("it");
      expect(wrapper.findAll(selectors.subRowLabel)[1].text()).toBe("en");
    });
  });

  describe("if the capacity type is pax", () => {
    test.skip("it should show all the fields filled in both main row sub row", () => {
      multilanguage.value = false;
      capacityType.value = CapacityType.PAX;
      const wrapper = mount(ResultTableRow, { props });

      // row
      expect(wrapper.find(selectors.rowAvailabilities).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowOptionName).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowTotal).text().length).toBeTruthy();

      // since the time is undefined it should not display the start time column
      expect(wrapper.find(selectors.rowTime).exists()).toBeFalsy();

      // sub row
      expect(wrapper.find(selectors.subRowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.subRowTotal).text().length).toBeTruthy();
      expect(wrapper.find(selectors.subRowAvailabilities).text().length).toBeTruthy();

      // the subrow label should be the pricing holder + the age range
      expect(wrapper.findAll(selectors.subRowLabel)[0].text()).toBe("adult 18 - 64");
      expect(wrapper.findAll(selectors.subRowLabel)[1].text()).toBe("adult 18 - 64");
    });
  });

  describe("if the capacity type is shared", () => {
    test.skip("it should show all the fields filled in the main row and only the booked in the sub row", () => {
      capacityType.value = CapacityType.SHARED;
      const wrapper = mount(ResultTableRow, { props });

      // row
      expect(wrapper.find(selectors.rowAvailabilities).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowOptionName).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowTotal).text().length).toBeTruthy();

      // since the time is undefined it should not display the start time column
      expect(wrapper.find(selectors.rowTime).exists()).toBeFalsy();

      // sub row
      expect(wrapper.find(selectors.subRowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.subRowTotal).text().length).toBeFalsy();
      expect(wrapper.find(selectors.subRowAvailabilities).text().length).toBeFalsy();

      // the subrow label should be the pricing holder + the age range
      expect(wrapper.findAll(selectors.subRowLabel)[0].text()).toBe("adult 18 - 64");
      expect(wrapper.findAll(selectors.subRowLabel)[1].text()).toBe("adult 18 - 64");
    });
  });

  describe("if the capacity type is unlimited", () => {
    test.skip("it should show booked and availability in the main row and only the booked in the sub row", () => {
      capacityType.value = CapacityType.UNLIMITED;
      const wrapper = mount(ResultTableRow, { props });

      // row
      expect(wrapper.find(selectors.rowAvailabilities).text()).toBe("common.unlimited");
      expect(wrapper.find(selectors.rowBookings).text().length).toBeTruthy();
      expect(wrapper.find(selectors.rowOptionName).text().length).toBeTruthy();

      // since the time is undefined it should not display the start time column
      expect(wrapper.find(selectors.rowTime).exists()).toBeFalsy();

      // sub row
      expect(wrapper.find(selectors.subRowBookings).text().length).toBeTruthy();

      // the subrow label should be the pricing holder + the age range
      expect(wrapper.findAll(selectors.subRowLabel)[0].text()).toBe("adult 18 - 64");
      expect(wrapper.findAll(selectors.subRowLabel)[1].text()).toBe("adult 18 - 64");
    });
  });

  describe("if the user click on the checkbox", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(ResultTableRow, { props });

      await wrapper.find(".checkbox-container__checkbox").trigger("click");
      const events = wrapper.emitted<string>()["toggle:checkbox"];

      expect(events[0][0]).toEqual("591ddc51-9fe4-3b54-9300-64cd1f89b913");
    });
  });

  describe("if the user edits the capacity", () => {
    test("it should call the onUpdateCapacity callback", async () => {
      capacityType.value = CapacityType.LANGUAGE;
      const wrapper = mount(ResultTableRow, { props });

      await wrapper.find(selectors.rowActions).find("button").trigger("click");
      await wrapper.find("#slot-availability-input").setValue(50);
      await wrapper.find(selectors.rowActions).find("[data-testid='result-table-save']").trigger("click");

      expect(props.onUpdateCapacity).toHaveBeenCalledTimes(1);
      expect(props.onUpdateCapacity).toHaveBeenCalledWith([
        {
          capacity: 50,
          id: "263183c2-ed55-3e43-a4d9-8b61a8822331",
        },
        {
          capacity: 12,
          id: "5ca578df-20f5-3c3e-b414-e973ba135cd2",
        },
      ]);
    });

    describe("if the user cancels the changes", () => {
      test("it should reset the input value", async () => {
        const wrapper = mount(ResultTableRow, { props });

        expect(wrapper.find(selectors.rowAvailabilities).text()).toBe("12");

        await wrapper.find(selectors.rowActions).find("button").trigger("click");
        await wrapper.find("#slot-availability-input").setValue(50);

        expect((wrapper.find("#slot-availability-input").element as HTMLInputElement).value).toBe("50");

        await wrapper.find(selectors.rowActions).find("[data-testid='nova-button-icon']").trigger("click");

        expect(wrapper.find(selectors.rowAvailabilities).text()).toBe("12");
      });
    });
  });

  describe("if the user click on the status switch", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(ResultTableRow, { props });

      await wrapper.find(".NovaSwitch").trigger("click");
      const events = wrapper.emitted<string>()["toggle:status"];

      expect(events[0][0]).toEqual({
        timeslice_id: "591ddc51-9fe4-3b54-9300-64cd1f89b913",
        value: false,
      });
    });
  });

  describe("if the option is group type", () => {
    test("it should show the 'group' label", () => {
      const wrapper = mount(ResultTableRow, {
        props: {
          ...props,
          timeSliceSlot: {
            ...props.timeSliceSlot,
            option: { ...props.timeSliceSlot.option, pricing_type_allowed: PricingDefinition.GROUP },
          },
        },
      });

      expect(wrapper.find("[data-testid='resultsubrow-label-group']").isVisible()).toBeTruthy();
    });
  });

  describe("if is readonly", () => {
    test("it should not be editable", () => {
      const wrapper = mount(ResultTableRow, { props: { ...props, readonly: true } });

      expect(wrapper.find(".NovaSwitch").attributes("disabled")).toBe("");
      expect(wrapper.find(".checkbox-container__checkbox").exists()).toBeFalsy();
      expect(wrapper.find(selectors.rowActions).findAll("*").length).toBe(0);
    });
  });
});
