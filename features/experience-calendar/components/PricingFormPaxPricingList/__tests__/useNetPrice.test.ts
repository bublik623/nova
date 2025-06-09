import { describe, expect, it } from "vitest";
import { useNetPrice } from "../useNetPrice";
import { Pricing } from "../PricingFormPaxPricingTypes";

describe("useNetPrice", () => {
  describe("result calculation", () => {
    it("returns 0 when the retail price is 0", () => {
      const pricing = ref<Pricing>({
        retailPrice: 0,
        commissionPercentage: (1 / 3) * 100,
      });

      const result = useNetPrice(pricing);

      expect(result.value).toBe(0);
    });

    it("returns the retail price when the commission is 0", () => {
      const retailPrice = 16;
      const pricing = ref<Pricing>({
        retailPrice,
        commissionPercentage: 0,
      });

      const result = useNetPrice(pricing);

      expect(result.value).toBe(retailPrice);
    });

    it("return the subtraction between retail price and commission amount", () => {
      const retailPrice = 16;
      const commissionPercentage = 10;
      const commissionAmount = retailPrice / commissionPercentage;
      const expectedResult = retailPrice - commissionAmount;

      const pricing = ref<Pricing>({
        retailPrice,
        commissionPercentage,
      });

      const result = useNetPrice(pricing);

      expect(result.value).toBe(expectedResult);
    });
  });

  describe("rounding", () => {
    it("returns at most two decimals", () => {
      const pricing = ref<Pricing>({
        retailPrice: 10,
        commissionPercentage: (1 / 3) * 100,
      });

      const result = useNetPrice(pricing);

      expect(result.value.toString().split(".")[1].length).toBe(2);
    });

    it("rounds the result to the next decimal when the remaining part is greater or equal to 5", () => {
      const pricing = ref<Pricing>({
        retailPrice: 10,
        commissionPercentage: (1 / 3) * 100,
      });

      const result = useNetPrice(pricing);

      expect(result.value).toBe(6.67);
    });

    it("truncate the result to the decimal position when the remaining part is lesser than 5", () => {
      const pricing = ref<Pricing>({
        retailPrice: 10,
        commissionPercentage: (2 / 3) * 100,
      });

      const result = useNetPrice(pricing);

      expect(result.value).toBe(3.33);
    });
  });
});
