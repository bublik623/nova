import { config, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import PricingFormHolderCard, { Props } from "../PricingFormHolderCard.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.stubs = {
  NovaButtonIcon: true,
  NovaFieldHeading: true,
  NovaInputText: true,
  NovaButton: true,
  NovaAlert: true,
  PricingFormHolderItem: true,
};

const props: Props = {
  modelValue: {
    cardId: "test-cardid",
    cardTitle: "test-cardtitle",
    fields: {
      id: "pricing-child",
      name: "Summer season",
      holder: "child",
      pricing_type: "person",
      age_range: { from: 1, to: 17 },
      option: "option-id",
      tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
    },
    isChanged: false,
    pricingIndex: 0,
    isDeleteModalVisible: false,
  },
  pricing: {
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
          holder: "child",
          pricing_type: "person",
          age_range: { from: 1, to: 17 },
          option: "option-id",
          tiers: [{ from: 1, to: 8, retail_price: 70.0, commission: 33, net_price: 46.9 }],
        },
        isChanged: false,
        pricingIndex: 0,
        isDeleteModalVisible: false,
      },
      {
        cardId: "test-cardid2",
        cardTitle: "test-cardtitle2",
        fields: {
          id: "pricing-child",
          name: "Summer season",
          holder: "child",
          pricing_type: "person",
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
  },
  optionId: "option-id",
};

const usePricingStoreMock = {
  getPricingError: vi.fn(() => false),
  handleAddHolder: vi.fn(),
  deletePricingCard: vi.fn(),
};

vi.mock("@/features/experience-calendar/store/usePricingStore", () => ({
  usePricingStore: () => usePricingStoreMock,
}));

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

describe("PricingFormHolderCard", () => {
  test("it renders correctly", () => {
    const wrapper = getWrapper();

    expect(wrapper).toBeTruthy();
    expect(wrapper.find('[data-testid="nova-collapse-title"]').text()).toBe("Child 1 - 17");
  });

  test("it clears correctly", async () => {
    const wrapper = getWrapper();

    await wrapper.find('[data-testid="clear-holder"]').trigger("click");

    expect(wrapper.props().modelValue.fields.name).toBe("");
    expect(wrapper.props().modelValue.fields.holder).toBe("");
    // the option id should not be cleared
    expect(wrapper.props().modelValue.fields.option).toBe("option-id");
    expect(wrapper.props().modelValue.fields.age_range).toStrictEqual({ from: 0, to: 0 });
    expect(wrapper.props().modelValue.fields.tiers).toStrictEqual([
      {
        commission: 0,
        from: 1,
        net_price: 0,
        retail_price: 1,
        to: 15,
      },
    ]);
  });

  test("it deletes correctly", async () => {
    const wrapper = getWrapper();

    await wrapper.find('[data-testid="delete-holder"]').trigger("click");
    await wrapper.find('[data-testid="modal"]').find('[data-testid="modal-save-btn"]').trigger("click");

    expect(usePricingStoreMock.deletePricingCard).toHaveBeenCalledWith(props.optionId, props.pricing.cardId, [
      props.modelValue,
    ]);
  });

  test("when is readonly, it should not be editable", () => {
    const wrapper = getWrapper({ readonly: true });
    expect(wrapper.find('[data-testid="clear-holder"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-testid="delete-holder"]').exists()).toBeFalsy();
  });
});

function getWrapper(newProps?: Partial<Props>) {
  return mount(PricingFormHolderCard, {
    props: { ...props, ...newProps },
  });
}
