import { describe, expect, test } from "vitest";
import { mapCurrencyOptions } from "../currency-utils";
import { Currency } from "@/types/generated/ContractMasterDataApi";

describe("currency-utils", () => {
  describe("mapCurrencyOptions", () => {
    test("should correctly map currency data to currency options", () => {
      const currenciesData: Partial<Currency>[] = [
        { code: "USD", symbol: "$" },
        { code: "EUR", symbol: "€" },
      ];

      const result = mapCurrencyOptions(currenciesData as Currency[]);

      expect(result).toEqual({
        USD: { label: "USD $", value: "USD", flag: "us" },
        EUR: { label: "EUR €", value: "EUR", flag: "eu" },
      });
    });
  });
});
