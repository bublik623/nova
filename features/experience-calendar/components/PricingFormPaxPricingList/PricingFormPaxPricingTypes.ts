import { PaxType as PaxTypeFromFieldPaxType } from "@/features/experience-raw/components/FieldPax/field-pax-types";

export type Pricing = {
  retailPrice: number;
  commissionPercentage: number;
  netPrice: number;
  purchasableAmountConstraint?: {
    min: number;
    max: number;
  };
};

export type PaxType = Omit<PaxTypeFromFieldPaxType, "selected">;

export type PaxPricing = {
  id: string | undefined;
  paxTypeCode: string;
  pricing: Pricing;
};
