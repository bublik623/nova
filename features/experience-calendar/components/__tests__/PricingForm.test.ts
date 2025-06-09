import { mount, config } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import PricingForm from "../PricingForm.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.stubs = {
  NovaButton: true,
  NovaFieldHeading: true,
  PricingFormPricingCard: true,
};

const TEST_OPTION_ID = "test-option-id";

const mockPricings = [
  {
    id: "pricing-child",
    name: "Summer season",
    holder: "child",
    age_range: { from: 1, to: 17 },
    option: "option-id",
    tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
  },
  {
    id: "pricing-adult",
    name: "Summer season",
    holder: "adult",
    age_range: { from: 18, to: 45 },
    option: "option-id",
    tiers: [{ from: 1, to: 4, retail_price: 100.0, commission: 34, net_price: 66.0 }],
  },
  {
    id: "pricing-adult",
    name: "Winter season",
    holder: "adult",
    age_range: { from: 18, to: 45 },
    option: "option-id",
    tiers: [{ from: 1, to: 4, retail_price: 100.0, commission: 34, net_price: 66.0 }],
  },
];

describe("PricingForm", () => {
  test("renders the correct title and description", () => {
    const wrapper = mount(PricingForm, {
      props: {
        optionId: TEST_OPTION_ID,
        isCuration: false,
        pricingCards: mockPricings,
      },
    });

    expect(wrapper.findComponent({ name: "NovaFieldHeading" }).props("title")).toBe("experience.pricing.title");
    expect(wrapper.findComponent({ name: "NovaFieldHeading" }).props("description")).toBe(
      "experience.pricing.description"
    );
  });

  test("renders the correct number of PricingFormPricingCard components", () => {
    const pricingCards = [{ cardId: "1" }, { cardId: "2" }, { cardId: "3" }];

    const wrapper = mount(PricingForm, {
      props: {
        pricingCards,
        optionId: TEST_OPTION_ID,
        isCuration: false,
      },
    });

    expect(wrapper.findAllComponents({ name: "PricingFormPricingCard" })).toHaveLength(pricingCards.length);
  });

  test('emits "create:pricingCard" event when "Add Pricing" button is clicked', async () => {
    const wrapper = mount(PricingForm);

    await wrapper.find('[data-testid="add-pricing"]').trigger("click");

    expect(wrapper.emitted("create:pricingCard")).toBeTruthy();
  });

  test("if is readonly, it should not be editable", () => {
    const pricingCards = [{ cardId: "1" }, { cardId: "2" }, { cardId: "3" }];

    const wrapper = mount(PricingForm, {
      props: {
        pricingCards,
        optionId: TEST_OPTION_ID,
        isCuration: false,
        readonly: true,
      },
    });

    expect(wrapper.find('[data-testid="add-pricing"]').exists()).toBeFalsy();
  });
});
