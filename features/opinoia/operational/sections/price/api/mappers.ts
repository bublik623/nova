import { formatDateForApi } from "@/features/opinoia/shared/utils/date-utils";
import { Price } from "../types";
import { PostInternalProductPricingMutationPayload } from "./mutations/usePostInternalProductPricingMutation";
import { PutInternalProductPricingMutationPayload } from "./mutations/usePutInternalProductPricingMutation";
import { Day } from "@/types/generated/OfferServiceApi";

type BasePricingPayload = PostInternalProductPricingMutationPayload &
  Omit<PutInternalProductPricingMutationPayload, "id">;

const DAYS = new Set<Day>(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]);

export function mapToNewPricingApiPayload(newPrice: Price) {
  return mapToBasePricingPayload(newPrice);
}

export function mapToExistingPricingApiPayload(editedPrice: Price) {
  const basePayload = mapToBasePricingPayload(editedPrice);
  return { ...basePayload, id: editedPrice.id };
}

function mapToBasePricingPayload(price: Price): BasePricingPayload {
  return {
    option_id: price.option_id,
    date_from: formatDateForApi(price.dateFrom),
    date_to: formatDateForApi(price.dateTo),
    currency: price.currency,
    languages: mapToLanguages(price.languages),
    days: ensureDaysOfTheWeek(price.days),
    prices: price.paxPrices.map(mapToPrice),
  };
}

function mapToLanguages(languages: string[] | "all"): string[] {
  if (languages === "all") {
    return [];
  }

  return languages;
}

function ensureDaysOfTheWeek(days: string[] | "all"): Day[] {
  if (days === "all") {
    return DAYS.values().toArray();
  }

  const invalidDays = days.filter((dayString) => !DAYS.has(dayString as Day));
  if (invalidDays.length > 0) {
    throw new Error(`given day array is invalid: ${invalidDays.join(", ")}`);
  }

  return days as Day[];
}

function mapToPrice(pricePerPax: Price["paxPrices"][number]): BasePricingPayload["prices"][number] {
  if (pricePerPax.cost === undefined) {
    throw new Error("cost can be undefined");
  }

  if (pricePerPax.initialPrice === undefined) {
    throw new Error("initialPrice can be undefined");
  }

  if (pricePerPax.suggestedPrice === undefined) {
    throw new Error("suggestedPrice can be undefined");
  }

  return {
    pax: pricePerPax.paxType,
    cost: pricePerPax.cost,
    initial: pricePerPax.initialPrice,
    suggested: pricePerPax.suggestedPrice,
  };
}
