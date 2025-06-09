import { Option } from "@/types/Option";
import { Currency } from "@/types/generated/ContractMasterDataApi";
import { currencyFlags } from "../constants/currency-constants";

interface CurrencyOption extends Option {
  label: string;
  flag: string;
}

/**
 * Maps currency data to a record of currency options.
 */
export const mapCurrencyOptions = (currenciesData: Currency[]): Record<string, CurrencyOption> => {
  return currenciesData.reduce((acc: Record<string, CurrencyOption>, currency) => {
    const code = currency.code as keyof typeof currencyFlags;
    const flag = currencyFlags[code];
    acc[code] = {
      label: `${currency.code} ${currency.symbol}`,
      value: currency.code,
      flag,
    };
    return acc;
  }, {});
};
