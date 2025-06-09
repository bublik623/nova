import { describe, test, expect, vi } from "vitest";
import { mount, VueWrapper, MountingOptions, config } from "@vue/test-utils";
import PricingFormHolderItem, { ExtendedHolderOption } from "../PricingFormHolderItem.vue";
import type { HolderItemProps } from "../PricingFormHolderItem.vue";
import { testId } from "@/utils/test.utils";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import { Currency } from "@/types/generated/ContractMasterDataApi";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.mock("@/features/experience-calendar/store/usePricingStore", () => ({
  usePricingStore: () => ({
    getPricingError: () => false,
  }),
}));

const mockHolderOptions: ExtendedHolderOption[] = [
  { label: "Adult", value: "adult", is_age_required: false },
  { label: "Child", value: "child", is_age_required: false },
  { label: "Youth", value: "youth", is_age_required: false },
  { label: "Selected Holder", value: "find-me", is_age_required: false },
  { label: "Group Holder", value: "group", is_age_required: true },
];

const mockCurrency: Currency = {
  code: "USD",
  description: "US Dollar",
  name: "US Dollar",
  symbol: "$",
};

const defaultProps: HolderItemProps = {
  holderTypeOptions: mockHolderOptions,
  selectedHolder: "",
  ageRangeFrom: 0,
  ageRangeTo: 0,
  amountFrom: 0,
  amountTo: 0,
  retailPrice: 0,
  commission: 0,
  netPrice: 0,
  showAllAges: false,
  name: "",
  index: 0,
  pricingType: "person",
  currency: mockCurrency,
};

describe("HolderItem", () => {
  let wrapper: VueWrapper<InstanceType<typeof PricingFormHolderItem>>;

  const render = (options: MountingOptions<HolderItemProps> = {}) => {
    wrapper = mount(PricingFormHolderItem, {
      props: defaultProps,
      ...options,
    });
  };

  const findHolderSelect = () => wrapper.find(testId("holder_type"));
  const findAgeRangeFrom = () => wrapper.find<HTMLInputElement>(testId("holder-age-from"));
  const findAgeRangeTo = () => wrapper.find<HTMLInputElement>(testId("holder-age-to"));
  const findAmountFrom = () => wrapper.find<HTMLInputElement>(testId("holder-amount-from"));
  const findAmountTo = () => wrapper.find<HTMLInputElement>(testId("holder-amount-to"));
  const findRetailPrice = () => wrapper.find<HTMLInputElement>(testId("holder-retail-price"));
  const findCommission = () => wrapper.find<HTMLInputElement>(testId("holder-commission"));
  const findNetPrice = () => wrapper.find<HTMLInputElement>(testId("holder-net-price"));
  const findAllAges = () => wrapper.find<HTMLInputElement>(testId("holder-all-ages"));
  const findPurchasableAmountButton = () => wrapper.find<HTMLButtonElement>(testId("button-purchasable"));

  test("it should render correctly", async () => {
    render();

    await findPurchasableAmountButton().trigger("click");
    expect(findHolderSelect().text()).toBe("input.option.placeholder");
    expect(findAgeRangeFrom().element.value).toBe("0");
    expect(findAgeRangeTo().element.value).toBe("0");
    expect(findAmountFrom().element.value).toBe("0");
    expect(findAmountTo().element.value).toBe("0");
    expect(findRetailPrice().element.value).toBe("0");
    expect(findCommission().element.value).toBe("0");
    expect(findNetPrice().element.value).toBe("0");
    expect(findAllAges().exists()).toBe(false);
  });

  test("verify correct option selection when component is mounted", async () => {
    render({
      props: {
        ...defaultProps,
        selectedHolder: "find-me",
      },
    });

    await nextTick();

    expect(findHolderSelect().text()).toBe("Selected Holder");
  });

  test("triggers an `edited` event when there is a change on any input", async () => {
    render();

    await findRetailPrice().setValue(5);

    const events = wrapper.emitted<number[]>().edited;
    expect(events[0][0]).toBe(true);

    await findCommission().setValue(4);
    expect(events[1][0]).toBe(true);
  });

  test("calculates net price", async () => {
    render();

    await findRetailPrice().setValue(10);
    await findCommission().setValue(10);

    expect(findNetPrice().element.value).toBe("9");
  });

  test("when changing holder, it should add the correct defaults", async () => {
    render({
      props: {
        ...defaultProps,
        selectedHolder: "children",
      },
    });

    await wrapper.findComponent(NovaSelect).vm.$emit("select:option", mockHolderOptions[4]);

    expect(findAgeRangeFrom().element.value).toBe("0");
    expect(findAgeRangeTo().element.value).toBe("99");

    await wrapper.findComponent(NovaSelect).vm.$emit("select:option", mockHolderOptions[2]);

    expect(findAgeRangeFrom().element.value).toBe("0");
    expect(findAgeRangeTo().element.value).toBe("0");
  });

  describe("All Ages checkbox", () => {
    test("toggle visibility using the `showAllAges` prop", async () => {
      render();

      expect(findAllAges().exists()).toBe(false);

      await wrapper.setProps({
        showAllAges: true,
      });

      expect(findAllAges().exists()).toBe(true);
    });

    test("when it's checked, the age-range-from and age-range-to fields should be disabled and set their values 0 and 99, respectively", async () => {
      render();

      await wrapper.setProps({
        showAllAges: true,
      });
      await findAllAges().get("input").trigger("click");

      expect(findAllAges().exists()).toBe(true);
      expect(findAgeRangeFrom().element.value).toBe("0");
      expect(findAgeRangeTo().element.value).toBe("99");
      expect(findAgeRangeTo().element.disabled).toBe(true);
      expect(findAgeRangeFrom().element.disabled).toBe(true);
    });

    test("when mounted, the all ages checkbox should be checked if ageRangeFrom is 0 and ageRangeTo is 99", () => {
      render({
        props: {
          ...defaultProps,
          showAllAges: true,
          ageRangeFrom: 0,
          ageRangeTo: 99,
        },
      });

      expect(findAgeRangeFrom().element.value).toBe("0");
      expect(findAgeRangeTo().element.value).toBe("99");
      expect(findAgeRangeTo().element.disabled).toBe(true);
      expect(findAgeRangeFrom().element.disabled).toBe(true);
    });

    test("when is readonly it should not be editable", async () => {
      render();

      await wrapper.setProps({
        readonly: true,
      });

      expect(findAgeRangeFrom().attributes("disabled")).toBe("");
      expect(findAgeRangeTo().attributes("disabled")).toBe("");
      expect(findAgeRangeTo().attributes("disabled")).toBe("");
      expect(findAgeRangeFrom().attributes("disabled")).toBe("");
      expect(findRetailPrice().attributes("disabled")).toBe("");
      expect(findCommission().attributes("disabled")).toBe("");
    });
  });
});
