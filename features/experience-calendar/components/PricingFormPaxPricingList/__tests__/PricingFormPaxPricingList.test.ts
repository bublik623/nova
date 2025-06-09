import { config, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PricingFormPaxPriceList, { PricingFormPaxPriceListItemProps } from "../PricingFormPaxPricingList.vue";
import { PaxPricing } from "../PricingFormPaxPricingTypes";
import { PaxType } from "@/features/experience-raw/components/FieldPax/field-pax-types";

config.global.mocks = {
  $t: (text: string) => text,
};

const paxType: Omit<PaxType, "selected"> = {
  code: "PAX_TYPE",
  label: "Pax type",
  allAges: false,
  ageFrom: 14,
  ageTo: 60,
  freeOfCharge: false,
};

const paxTypeAllAges: Omit<PaxType, "selected"> = {
  code: "PAX_TYPE_ALL_AGES",
  label: "Pax type all ages",
  allAges: true,
  ageFrom: 0,
  ageTo: 0,
  freeOfCharge: false,
};

const paxTypeFreeOfCharge: Omit<PaxType, "selected"> = {
  code: "PAX_TYPE_FREE_OF_CHARGE",
  label: "Pax type Free of charge",
  allAges: false,
  ageFrom: 0,
  ageTo: 2,
  freeOfCharge: true,
};

const paxTypeAllAgesFreeOfCharge: Omit<PaxType, "selected"> = {
  code: "PAX_TYPE_ALL_AGES_FREE_OF_CHARGE",
  label: "Pax type all ages Free of charge",
  allAges: true,
  ageFrom: 0,
  ageTo: 0,
  freeOfCharge: true,
};

const props: PricingFormPaxPriceListItemProps = {
  paxTypes: [paxType, paxTypeFreeOfCharge, paxTypeAllAges, paxTypeAllAgesFreeOfCharge],
  currency: { code: "EUR", name: "Euro", symbol: "€" },
  readonly: false,
};

describe("PricingFormPaxPriceList", () => {
  describe("display a list item for each pax type in the model value", () => {
    it("renders a PricingFormPaxPriceListItem for each pax type", () => {
      const wrapper = mount(PricingFormPaxPriceList, { props: { ...props, modelValue: [] } });

      const pricingFormPaxListItems = wrapper.findAllComponents({ name: "PricingFormPaxPricingListItem" });

      expect(pricingFormPaxListItems.length).toBe(props.paxTypes.length);
    });

    it("renders a checkbox for each list item", () => {
      const wrapper = mount(PricingFormPaxPriceList, { props: { ...props, modelValue: [] } });

      const checkboxes = wrapper.findAll("input[type='checkbox']");

      expect(checkboxes.length).toBe(props.paxTypes.length);
    });
  });

  describe("selecting a pax type", () => {
    it("adds an item related to the selected pax type in the model-value when a pax type is selected", async () => {
      const modelValue: PaxPricing[] = [];

      const wrapper = mount(PricingFormPaxPriceList, { props: { ...props, modelValue } });

      const paxTypeFreeOfChargeCheckbox = wrapper.find(`#checkbox-${paxTypeFreeOfCharge.code}`);
      await paxTypeFreeOfChargeCheckbox.trigger("click");

      expect(modelValue.length).toBe(1);
      expect(modelValue[0]).toMatchObject({
        id: undefined,
        paxTypeCode: paxTypeFreeOfCharge.code,
        pricing: { retailPrice: 0, commissionPercentage: 0, netPrice: 0 },
      });
    });

    it("renders a PaxPriceField for the selected pax type", async () => {
      const wrapper = mount(PricingFormPaxPriceList, { props: { ...props, modelValue: [] } });

      const paxTypeFreeOfChargeCheckbox = wrapper.find(`#checkbox-${paxTypeFreeOfCharge.code}`);
      await paxTypeFreeOfChargeCheckbox.trigger("click");

      const paxPriceFields = wrapper.findAllComponents({ name: "PaxPricingField" });
      expect(paxPriceFields.length).toBe(1);
      expect(paxPriceFields[0].props().paxType).toStrictEqual(paxTypeFreeOfCharge);
    });
  });

  describe("de-selecting a pax type", () => {
    it("removes the related pricing value from the model value when a pax type is de-selected", async () => {
      const modelValue: PaxPricing[] = props.paxTypes.map((paxType) => ({
        paxTypeCode: paxType.code,
        pricing: { retailPrice: 0, commissionPercentage: 0 },
      }));

      const wrapper = mount(PricingFormPaxPriceList, { props: { ...props, modelValue } });

      const paxTypeFreeOfChargeCheckbox = wrapper.find(`#checkbox-${paxTypeFreeOfCharge.code}`);
      await paxTypeFreeOfChargeCheckbox.trigger("click");

      expect(modelValue.length).toBe(3);
      const paxTypeFreeOfChargeModelValue = modelValue.find((item) => item.paxTypeCode === paxTypeFreeOfCharge.code);
      expect(paxTypeFreeOfChargeModelValue).toBeUndefined();
    });

    it("no longer renders the PaxPriceField for the un-selected pax types", async () => {
      const modelValue: PaxPricing[] = props.paxTypes.map((paxType) => ({
        paxTypeCode: paxType.code,
        pricing: { retailPrice: 0, commissionPercentage: 0 },
      }));

      const wrapper = mount(PricingFormPaxPriceList, { props: { ...props, modelValue } });

      const paxTypeFreeOfChargeCheckbox = wrapper.find(`#checkbox-${paxTypeFreeOfCharge.code}`);
      await paxTypeFreeOfChargeCheckbox.trigger("click");

      const paxPriceFields = wrapper.findAllComponents({ name: "PaxPricingField" });
      expect(paxPriceFields.length).toBe(3);
      expect(paxPriceFields.map((paxPriceField) => paxPriceField.props().paxType)).not.contain(paxTypeFreeOfCharge);
    });
  });
});
