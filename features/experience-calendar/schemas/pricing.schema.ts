import { z, SuperRefinement } from "zod";
import { getAgeRequiredHolders } from "../lib/experience-option-pricing";
import { Pricing } from "@/types/generated/OfferServiceApiOld";
import { Pricing as NewApiPricing } from "@/types/generated/OfferServiceApi";

export const tiersSchema = z
  .object({
    from: z.coerce.number().min(1),
    to: z.coerce.number().min(1),
    retail_price: z.coerce.number().min(0),
    commission: z.coerce.number().min(0),
    net_price: z.coerce.number().min(0),
  })
  .refine((data) => data.to > data.from, {
    message: "'To' should be greater than 'From",
    path: ["to"],
  });

export const pricingSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1),
    holder: z.string().min(1),
    age_range: z.object({
      from: z.coerce.number().min(0).max(99),
      to: z.coerce.number().min(0).max(99),
    }),
    tiers: z.array(tiersSchema),
    option: z.string(),
    pricing_type: z.enum(["person", "group"]),
  })
  .refine((data) => data.age_range.to >= data.age_range.from, {
    message: "'To' should be greater than or equal to 'From'",
    path: ["age_range", "to"],
  });

export const paxPricingTierSchema = z
  .object({
    from: z.coerce.number().min(1).optional(),
    to: z.coerce.number().min(1).optional(),
    retail_price: z.coerce.number().min(0),
    commission: z.coerce.number().min(0),
    net_price: z.coerce.number().min(0),
  })
  .superRefine((data, ctx) => {
    const lowerBoundDefined = data.from !== undefined;
    const higherBoundDefined = data.to !== undefined;

    if (lowerBoundDefined != higherBoundDefined) {
      ctx.addIssue({
        message: "None or both ends need to be specified",
        code: "custom",
      });

      return;
    }

    if (lowerBoundDefined && higherBoundDefined && data.from! > data.to!) {
      ctx.addIssue({
        message: "'To' should be greater than 'From",
        path: ["to"],
        code: "custom",
      });
    }
  });

export const paxPricingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  holder: z.string().min(1),
  option_id: z.string(),
  age_range: z
    .object({
      from: z.coerce.number().min(0).max(99).optional(),
      to: z.coerce.number().min(0).max(99).optional(),
    })
    .optional()
    .superRefine((data, ctx) => {
      const ageRangeDefined = data !== undefined;
      const lowerBoundDefined = data?.from !== undefined;
      const upperBoundDefined = data?.to !== undefined;

      if (ageRangeDefined && (!lowerBoundDefined || !upperBoundDefined)) {
        ctx.addIssue({ message: "None or both ends need to be specified", path: ["age_range"], code: "custom" });
      }

      if (ageRangeDefined && lowerBoundDefined && upperBoundDefined && data.from! > data.to!) {
        ctx.addIssue({
          message: "'To' should be greater than or equal to 'From'",
          path: ["age_range", "to"],
          code: "custom",
        });
      }
    }),
  tiers: z.array(paxPricingTierSchema),
  pricing_type: z.enum(["person", "group"]),
});

const overlappingAgeRangesValidation: SuperRefinement<Pricing[]> = (data, ctx) => {
  const holderNamesToSkipForOverlapCheck = getAgeRequiredHolders().map((holderItem) => holderItem.value);
  const filteredPricingItems = data.filter((holder) => !holderNamesToSkipForOverlapCheck.includes(holder.holder));

  const groupedHoldersByPricingName = filteredPricingItems.reduce<Record<string, Pricing[]>>((acc, holder) => {
    if (!acc[holder.name]) {
      acc[holder.name] = [];
    }
    acc[holder.name].push(holder);
    return acc;
  }, {});

  // loop through each pricing item and check if there is an overlapping age range
  Object.values(groupedHoldersByPricingName).forEach((pricingItems) => {
    pricingItems.forEach((holder, idx) => {
      const overlappingHolder = pricingItems
        .slice(idx + 1)
        .find(
          (nextHolder) =>
            holder.age_range.from <= nextHolder.age_range.to && holder.age_range.to >= nextHolder.age_range.from
        );

      if (overlappingHolder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You cannot have overlapping age ranges ",
          path: [filteredPricingItems.indexOf(overlappingHolder), "age_range"],
        });
      }
    });
  });
};

const retailPriceValidation: SuperRefinement<Pricing[] | NewApiPricing[]> = (data, ctx) => {
  let hasRetailPrice: boolean = false;
  data.forEach((holder) => {
    holder.tiers.forEach(({ retail_price }) => {
      if (retail_price > 0) {
        hasRetailPrice = retail_price > 0;
      }
    });
  });
  if (!hasRetailPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one tier should have a retail price greater than 0",
      path: ["missing_retail_price"],
    });
  }
};

export const pricingFormSchema = z
  .array(pricingSchema)
  .min(1)
  .superRefine(overlappingAgeRangesValidation)
  .superRefine(retailPriceValidation);

export const paxPricingFormSchema = z.array(paxPricingSchema).min(1).superRefine(retailPriceValidation);
