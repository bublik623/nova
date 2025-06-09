import {
  PaxPricing,
  PaxType,
} from "@/features/experience-calendar/components/PricingFormPaxPricingList/PricingFormPaxPricingTypes";
import { Pricing } from "./generated/OfferServiceApiOld";

export type HolderCard = {
  // Since each holder is also a pricing we need to keep track of real pricing index for the validation purposes
  pricingIndex: number;
  cardId: string;
  isChanged: boolean;
  isDeleteModalVisible: boolean;
  fields: Pricing;
  cardTitle: string;
};

export type PricingCard = {
  cardId: string;
  pricingName: string;
  holders: HolderCard[];
  paxPricingList: PaxPricing[];
  isOpen: boolean;
  isDeleteModalVisible: boolean;
  /**
   * Needed for backward compatibility with Experiences created before
   * the new pricing mode (selecting pax types at experience level).
   * If we just make a single set of derived pax types across all different pricing cards,
   * PaxTypes existing in more Pricings with different age-ranges
   * would be repeated multiple time in each Pricing Card.
   */
  paxTypes: PaxType[];
};
