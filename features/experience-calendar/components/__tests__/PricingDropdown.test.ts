import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import PricingDropdown, { Props } from "../PricingDropdown.vue";
import { Pricing } from "@/types/generated/OfferServiceApiOld";

config.global.mocks = {
  $t: (s: string) => s,
};

const pricings: Pricing[] = [
  {
    id: "1",
    name: "High Season",
    holder: "Adult",
    age_range: { from: 16, to: 59 },
    tiers: [],
    option: "",
  },
  {
    id: "2",
    name: "High Season",
    holder: "Child",
    age_range: { from: 1, to: 15 },
    tiers: [],
    option: "",
  },
  {
    id: "3",
    name: "High Season",
    holder: "Senior",
    age_range: { from: 60, to: 99 },
    tiers: [],
    option: "",
  },
  {
    id: "4",
    name: "Low Season",
    holder: "Adult",
    age_range: { from: 16, to: 59 },
    tiers: [],
    option: "",
  },
  {
    id: "5",
    name: "Low Season",
    holder: "Child",
    age_range: { from: 1, to: 15 },
    tiers: [],
    option: "",
  },
  {
    id: "6",
    name: "Low Season",
    holder: "Senior",
    age_range: { from: 60, to: 99 },
    tiers: [],
    option: "",
  },
];

const props: Props = {
  pricingList: pricings,
  modelValue: [],
};

const selectors = {
  toggle: "[data-testid='pricing-dropdown-toggle']",
  clearBtn: "[data-testid='pricing-clear-all-btn']",
  pricingGroup: "[data-testid='pricing-group']",
  pricingItem: "[data-testid='pricing-item']",
  capacityInput: "[data-testid='pricing-capacity-input']",
};

describe("PricingDropdown", () => {
  test("it should render correctly", async () => {
    const wrapper = mount(PricingDropdown, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.toggle).text()).toContain("pricing.dropdown.placeholder");
    expect(wrapper.find(selectors.toggle).attributes().invalid).toBe(undefined);

    // it should open
    await wrapper.find(selectors.toggle).trigger("click");

    expect(wrapper.findAll(selectors.pricingGroup).length).toBe(2);
    expect(wrapper.findAll(selectors.pricingItem).length).toBe(6);

    await wrapper.find(selectors.toggle).trigger("click");
    await wrapper.setProps({ ...props, disabled: true });
    // it should not open
    await wrapper.find(selectors.toggle).trigger("click");

    expect(wrapper.findAll(selectors.pricingGroup).length).toBe(0);
    expect(wrapper.findAll(selectors.pricingItem).length).toBe(0);
  });

  describe("when the user selects a pricing", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(PricingDropdown, { props });

      await wrapper.find(selectors.toggle).trigger("click");
      const pricings = wrapper.findAll(selectors.pricingItem);
      await pricings[2].find("input").trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual([
        {
          pricing: "3",
        },
      ]);
    });

    describe("if the pricing is already selected", () => {
      test("it should deselect it", async () => {
        const wrapper = mount(PricingDropdown, {
          props: {
            ...props,
            modelValue: [
              {
                pricing: "1",
              },
            ],
          },
        });

        await wrapper.find(selectors.toggle).trigger("click");
        const pricings = wrapper.findAll(selectors.pricingItem);
        await pricings[0].find("input").trigger("click");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeTruthy();
        expect(events.length).toBe(1);
        expect(events[0][0]).toEqual([]);
      });
    });

    describe("when some pricing are already selected", () => {
      test("it should emit an event updating the array of pricings", async () => {
        const wrapper = mount(PricingDropdown, {
          props: {
            ...props,
            modelValue: [
              {
                pricing: "1",
              },
            ],
          },
        });

        await wrapper.find(selectors.toggle).trigger("click");
        const pricings = wrapper.findAll(selectors.pricingItem);
        await pricings[2].find("input").trigger("click");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeTruthy();
        expect(events.length).toBe(1);
        expect(events[0][0]).toEqual([
          {
            pricing: "1",
          },
          {
            pricing: "3",
          },
        ]);
      });
    });

    describe("when pricings from a different group are selected", () => {
      test("it should reset the list and emit an event", async () => {
        const wrapper = mount(PricingDropdown, {
          props: {
            ...props,
            modelValue: [
              {
                pricing: "1",
              },
              {
                pricing: "2",
              },
            ],
          },
        });

        await wrapper.find(selectors.toggle).trigger("click");
        const pricings = wrapper.findAll(selectors.pricingItem);
        await pricings[5].find("input").trigger("click");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeTruthy();
        expect(events.length).toBe(1);
        expect(events[0][0]).toEqual([
          {
            pricing: "6",
          },
        ]);
      });
    });
  });

  describe("when the user selects a pricing group", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(PricingDropdown, { props });

      await wrapper.find(selectors.toggle).trigger("click");
      const pricingGroups = wrapper.findAll(selectors.pricingGroup);
      await pricingGroups[0].find("input").trigger("change");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual([
        {
          pricing: "1",
        },
        {
          pricing: "2",
        },
        {
          pricing: "3",
        },
      ]);
    });

    describe("when another pricing group is selected", () => {
      test("it should reset the list and emit an event", async () => {
        const wrapper = mount(PricingDropdown, {
          props: {
            ...props,
            modelValue: [
              {
                pricing: "1",
              },
              {
                pricing: "2",
              },
              {
                pricing: "3",
              },
            ],
          },
        });

        await wrapper.find(selectors.toggle).trigger("click");
        const pricingGroups = wrapper.findAll(selectors.pricingGroup);
        await pricingGroups[1].find("input").trigger("change");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeTruthy();
        expect(events.length).toBe(1);
        expect(events[0][0]).toEqual([
          {
            pricing: "4",
          },
          {
            pricing: "5",
          },
          {
            pricing: "6",
          },
        ]);
      });
    });
  });

  describe("when the user clicks on the clear all button", () => {
    test("it should reset the value and emit an event", async () => {
      const wrapper = mount(PricingDropdown, {
        props: {
          ...props,
          modelValue: [
            {
              pricing: "1",
            },
            {
              pricing: "2",
            },
            {
              pricing: "3",
            },
          ],
        },
      });

      await wrapper.find(selectors.toggle).trigger("click");
      await wrapper.find(selectors.clearBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual([]);
    });
  });

  describe("when it has limited capacity", () => {
    test("it should display an input to select the capacity", async () => {
      const wrapper = mount(PricingDropdown, {
        props: { ...props, limitedCapacity: true },
      });

      expect(wrapper).toBeTruthy();
      expect(wrapper.find(selectors.toggle).text()).toContain("pricing.dropdown.placeholder");

      await wrapper.find(selectors.toggle).trigger("click");

      expect(wrapper.findAll(selectors.pricingGroup).length).toBe(2);
      expect(wrapper.findAll(selectors.pricingItem).length).toBe(6);

      const capacityInputs = wrapper.findAll(selectors.capacityInput);
      expect(capacityInputs.length).toBe(6);
      capacityInputs.forEach((i) => {
        expect(i.attributes().disabled).toBe("");
      });
    });

    describe("when a pricing is selected", () => {
      test("it should enable the capacity input", async () => {
        const wrapper = mount(PricingDropdown, {
          props: {
            ...props,
            limitedCapacity: true,
            modelValue: [
              {
                pricing: "2",
              },
            ],
          },
        });

        await wrapper.find(selectors.toggle).trigger("click");

        const capacityInputs = wrapper.findAll(selectors.capacityInput);
        expect(capacityInputs[1].attributes().disabled).toBe(undefined);
      });

      describe("when the user inserts a capacity", () => {
        test("it should emit an event", async () => {
          const wrapper = mount(PricingDropdown, {
            props: {
              ...props,
              limitedCapacity: true,
              type: "person",
              modelValue: [
                {
                  pricing: "2",
                },
              ],
            },
          });

          await wrapper.find(selectors.toggle).trigger("click");
          expect(wrapper.text()).include("pricing.dropdown.header.capacity.person");
          const capacityInputs = wrapper.findAll(selectors.capacityInput);
          await capacityInputs[1].setValue(80);

          const events = wrapper.emitted<Event[]>()["update:modelValue"];
          expect(events).toBeTruthy();
          expect(events.length).toBe(1);
          expect(events[0][0]).toEqual([
            {
              pricing: "2",
              capacity: 80,
            },
          ]);
        });
      });
    });
  });

  describe("is it's invalid", () => {
    test("it should have a custom attribute", async () => {
      const wrapper = mount(PricingDropdown, {
        props: {
          ...props,
          limitedCapacity: true,
          type: "group",
          modelValue: [
            {
              pricing: "2",
              capacity: 0,
            },
          ],
          validationErrors: { _errors: ["custom error"] },
        },
      });

      expect(wrapper.find(selectors.toggle).attributes().invalid).toBe("true");

      await wrapper.find(selectors.toggle).trigger("click");
      expect(wrapper.text()).include("pricing.dropdown.header.capacity.group");
      const capacityInputs = wrapper.findAll(selectors.capacityInput);

      expect(capacityInputs[1].attributes()["data-invalid"]).toBe("true");

      await capacityInputs[1].setValue(10);
      expect(capacityInputs[1].attributes()["data-invalid"]).toBeUndefined();
    });
  });
});
