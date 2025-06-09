import { Price } from "../types";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
export type SortingDirection = "asc" | "desc";
export type PriceSortColumn = "option";

export function usePriceTable(prices: Ref<Price[]>) {
  const collapsedPaxPrices = ref<string[]>([]);

  // todo replace with useSortedOptions?
  const sortColumn = ref<PriceSortColumn>("option");
  const sortDirection = ref<SortingDirection>("asc");

  function sortBy(column: PriceSortColumn) {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
      sortColumn.value = column;
      sortDirection.value = "asc";
    }
  }

  function addNewPrice() {
    const newPrice: Price = {
      id: nanoid(),
      option_id: "",
      dateFrom: "",
      dateTo: "",
      currency: "",
      languages: [],
      days: [],
      paxPrices: [],
    };

    prices.value.push(newPrice);
  }

  function duplicatePrice(price: Price) {
    const duplicatedPrice: Price = { ...cloneDeep(price), id: nanoid() };

    const priceIndex = prices.value.findIndex((p) => p.id === price.id);
    if (priceIndex !== -1) {
      prices.value.splice(priceIndex + 1, 0, duplicatedPrice);
    } else {
      prices.value.push(duplicatedPrice);
    }
  }

  function removePrice(price: Price) {
    const priceIndex = prices.value.findIndex((p) => p.id === price.id);
    if (priceIndex !== -1) {
      prices.value.splice(priceIndex, 1);
    }
  }

  function toggleCollapsedPaxPrices(priceId: string) {
    if (collapsedPaxPrices.value.includes(priceId)) {
      collapsedPaxPrices.value = collapsedPaxPrices.value.filter((id) => id !== priceId);
    } else {
      collapsedPaxPrices.value.push(priceId);
    }
  }

  return {
    collapsedPaxPrices,
    sortColumn: readonly(sortColumn),
    sortDirection: readonly(sortDirection),
    sortBy,
    addNewPrice,
    duplicatePrice,
    removePrice,
    toggleCollapsedPaxPrices,
  };
}
