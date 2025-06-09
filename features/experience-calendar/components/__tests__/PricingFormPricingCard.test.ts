import { PricingCard } from "@/types/Pricing";
import NovaFieldHeading from "@/ui-kit/NovaFieldHeading/NovaFieldHeading.vue";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import { mount, config } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import PricingFormPricingCard, { Props } from "../PricingFormPricingCard.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.stubs = {
  NovaButtonIcon: true,
  NovaFieldHeading: true,
  NovaInputText: true,
  NovaButton: true,
  NovaAlert: true,
  PricingFormHolderCard: true,
};

const usePricingStoreMock = {
  state: { paxTypes: [] },
  getPricingError: vi.fn(() => false),
  handleAddHolder: vi.fn(),
  deletePricingCard: vi.fn(),
};

vi.mock("@/features/experience-calendar/store/usePricingStore", () => ({
  usePricingStore: () => usePricingStoreMock,
}));

const pricingCard: PricingCard = {
  cardId: "1",
  isOpen: false,
  pricingName: "",
  holders: [
    {
      cardId: "test-cardid",
      cardTitle: "test-cardtitle",
      fields: {
        id: "pricing-child",
        name: "Summer season",
        pricing_type: "person",
        holder: "child",
        age_range: { from: 1, to: 17 },
        option: "option-id",
        tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
      },
      isChanged: false,
      pricingIndex: 0,
      isDeleteModalVisible: false,
    },
  ],
  isDeleteModalVisible: false,
  paxPricingList: [
    {
      id: "pricing-child",
      paxTypeCode: "child",
      pricing: {
        retailPrice: 70,
        commissionPercentage: 33,
        netPrice: 46.9,
        purchasableAmountConstraint: { min: 1, max: 8 },
      },
    },
  ],
  paxTypes: [{ code: "child", label: "Child", freeOfCharge: false, allAges: false, ageFrom: 1, ageTo: 17 }],
};

const props: Props = {
  modelValue: pricingCard,
  optionId: "1",
  index: 0,
  pricingType: "person",
  currency: { code: "EUR", symbol: "€", name: "Euro" },
};

describe("PricingFormPricingCard", () => {
  test("renders the correct title and description", () => {
    const wrapper = getWrapper();

    expect(wrapper.findComponent(NovaFieldHeading).props("title")).toBe("experience.pricing.name.title");
    expect(wrapper.findComponent(NovaFieldHeading).props("description")).toBe("experience.pricing.name.description");
  });

  test("it updates the name correctly", async () => {
    const wrapper = getWrapper();

    wrapper.getComponent(NovaInputText).vm.$emit("update:modelValue", "new name");

    expect(wrapper.props().modelValue.pricingName).toBe("new name");
    expect(wrapper.props().modelValue.holders[0].fields.name).toBe("new name");
  });

  test("it requests the error correctly", () => {
    getWrapper();

    expect(usePricingStoreMock.getPricingError).toHaveBeenNthCalledWith(1, "0.name");
    expect(usePricingStoreMock.getPricingError).toHaveBeenNthCalledWith(2, "0.age_range");
  });

  describe("person price type management", () => {
    test("it delegate Person pricing management to PricingFormPaxPricingList component", async () => {
      const wrapper = getWrapper();

      const pricingList = wrapper.findComponent({ name: "PricingFormPaxPricingList" });

      expect(pricingList.props()).toStrictEqual(
        expect.objectContaining({
          modelValue: props.modelValue.paxPricingList,
        })
      );
    });
  });

  describe("group price type management", () => {
    test("it adds a group correctly", async () => {
      const wrapper = getWrapper({ pricingType: "group" });

      await wrapper.find('[data-testid="add-holder"]').trigger("click");

      expect(usePricingStoreMock.handleAddHolder).toHaveBeenCalledWith(pricingCard, "1", "group");
    });
  });

  test("it deletes a card correctly", async () => {
    const wrapper = getWrapper();

    await wrapper.find('[data-testid="delete-pricing"]').trigger("click");
    await wrapper.find('[data-testid="modal"]').find('[data-testid="modal-save-btn"]').trigger("click");

    expect(usePricingStoreMock.deletePricingCard).toHaveBeenCalledWith("1", pricingCard.cardId, pricingCard.holders);
  });

  test("when is readonly, it should not be editable", () => {
    const wrapper = getWrapper({ readonly: true, pricingType: "person" });
    expect(wrapper.find('[data-testid="delete-pricing"]').exists()).toBeFalsy();
  });
});

function getWrapper(newProps?: Partial<Props>) {
  return mount(PricingFormPricingCard, {
    props: {
      ...props,
      ...newProps,
    },
  });
}
