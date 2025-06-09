import { config, mount } from "@vue/test-utils";
import { vi, describe, expect, it, afterEach } from "vitest";
import PaxPricingField, { PaxPricingProps } from "../PaxPricingField.vue";
import { PaxType, Pricing } from "../PricingFormPaxPricingTypes";
import { useNetPrice } from "@/features/experience-calendar/components/PricingFormPaxPricingList/useNetPrice";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.mock("@/features/experience-calendar/components/PricingFormPaxPricingList/useNetPrice");

const paxTypeNotFreeOfCharge: PaxType = {
  code: "PAX_TYPE",
  label: "Pax type",
  allAges: false,
  ageFrom: 14,
  ageTo: 60,
  freeOfCharge: false,
};

const paxTypeFreeOfCharge: PaxType = {
  code: "PAX_TYPE_FREE_OF_CHARGE",
  label: "Pax type Free of charge",
  allAges: false,
  ageFrom: 0,
  ageTo: 2,
  freeOfCharge: true,
};

const currency = { code: "EUR", name: "Euro", symbol: "€" };

describe("PaxPriceField", () => {
  afterEach(() => vi.restoreAllMocks());

  describe("pax type NOT free of charge", () => {
    const props: PaxPricingProps = { paxType: paxTypeNotFreeOfCharge, currency, readonly: false };

    it("allows to edit the retail price", async () => {
      const modelValue = getModelValue();
      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue } });

      const retailPriceInput = wrapper.find(`#retail-price-${paxTypeNotFreeOfCharge.code}`);
      await retailPriceInput.setValue("6");

      expect(modelValue.retailPrice).toBe(6);
    });

    it("allows to edit the commission", async () => {
      const modelValue = getModelValue();
      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue } });

      const retailPriceInput = wrapper.find(`#commission-${paxTypeNotFreeOfCharge.code}`);
      await retailPriceInput.setValue("13");

      expect(modelValue.commissionPercentage).toBe(13);
    });

    it("displays the net price", async () => {
      const useNetPriceMock = vi.mocked(useNetPrice);

      const modelValue = getModelValue();
      modelValue.retailPrice = 10;
      modelValue.commissionPercentage = 33.33;

      useNetPriceMock.mockReturnValue(computed(() => 1000));
      const expectedNetPrice = "1000";

      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue } });

      const netPriceInput = wrapper.find<HTMLInputElement>(`#net-price-${paxTypeNotFreeOfCharge.code}`);

      /**
       * Using toHaveBeenCalledWith would result in an out of memory error.
       * I believe it's caused by the structure/implementation of the ModelRef that's passed
       * as argument to the useNetPrice composable.
       */
      expect(useNetPriceMock.mock.calls[0][0].value).toStrictEqual(modelValue);
      expect(useNetPriceMock).toHaveBeenCalledOnce();
      expect(netPriceInput.element.value).toBe(expectedNetPrice);
    });

    it("prevents from editing the net price", () => {
      const modelValue = getModelValue();

      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue } });

      const netPriceInput = wrapper.find(`#net-price-${paxTypeNotFreeOfCharge.code}`);

      expect(netPriceInput.attributes().disabled).toBeDefined();
    });

    itSupportsPurchasableQuantityConstraint(paxTypeNotFreeOfCharge);
  });

  describe("pax type free of charge", () => {
    const props: PaxPricingProps = { paxType: paxTypeFreeOfCharge, currency, readonly: false };

    it("does not allow to edit, nor display the retail price", () => {
      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue: getModelValue() } });

      expect(wrapper.find(`#retail-price-${paxTypeFreeOfCharge.code}`).exists()).toBe(false);
    });

    it("does not allow to edit, nor display the commission", () => {
      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue: getModelValue() } });

      expect(wrapper.find(`#commission-${paxTypeFreeOfCharge.code}`).exists()).toBe(false);
    });

    it("does not display the net price", () => {
      const wrapper = mount(PaxPricingField, { props: { ...props, modelValue: getModelValue() } });

      expect(wrapper.find(`#net-price-${paxTypeFreeOfCharge.code}`).exists()).toBe(false);
    });

    itSupportsPurchasableQuantityConstraint(paxTypeFreeOfCharge);
  });

  function itSupportsPurchasableQuantityConstraint(paxType: PaxType) {
    describe("purchasable quantity constraint", () => {
      const props: PaxPricingProps = { paxType, currency, readonly: false };

      describe("when there is NOT a constraint on purchasable quantity", () => {
        it("allows to add a constraint on purchasable quantity", async () => {
          const modelValue = getModelValue();
          const wrapper = mount(PaxPricingField, {
            props: { ...props, modelValue },
          });

          await wrapper.find(`[data-testid="add-purchasable-amount-${paxType.code}"]`).trigger("click");
          expect(modelValue.purchasableAmountConstraint).toStrictEqual({ min: 1, max: 15 });
        });
      });

      describe("when there is a constraint on purchasable quantity", () => {
        it("allows to edit the minimum purchasable quantity", async () => {
          const modelValue = getModelValue({ purchasableAmountConstraint: { min: 0, max: 0 } });
          const wrapper = mount(PaxPricingField, {
            props: { ...props, modelValue },
          });

          await wrapper.find(`#purchasable-amount-min-${paxType.code}`).setValue(54);
          expect(modelValue.purchasableAmountConstraint?.min).toBe(54);
        });

        it("allows to edit the maximum purchasable quantity", async () => {
          const modelValue = getModelValue({ purchasableAmountConstraint: { min: 0, max: 0 } });
          const wrapper = mount(PaxPricingField, {
            props: { ...props, modelValue },
          });

          await wrapper.find(`#purchasable-amount-max-${paxType.code}`).setValue(54);
          expect(modelValue.purchasableAmountConstraint?.max).toBe(54);
        });

        it("allows to remove the constraint on purchasable quantity", async () => {
          const modelValue = getModelValue({ purchasableAmountConstraint: { min: 0, max: 0 } });
          const wrapper = mount(PaxPricingField, {
            props: { ...props, modelValue },
          });

          await wrapper.find(`[data-testid='purchasable-amount-remove-${paxType.code}']`).trigger("click");
          expect(modelValue.purchasableAmountConstraint).toBeUndefined();
        });
      });
    });
  }
});

function getModelValue(template?: Partial<Pricing>): Pricing {
  return { retailPrice: 0, commissionPercentage: 0, ...template };
}
