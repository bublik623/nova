import { z, ZodFormattedError } from "zod";
import { isEmpty } from "lodash";
import { Pax } from "@/types/generated/OfferServiceApi";

// TODO: https://jira.tuigroup.com/browse/OFF-4386
const paxCodesToSkipOverlapCheck = [
  "eu-citizen",
  "military",
  "disabled",
  "eu-teacher",
  "student",
  "participant",
  "caregiver",
  "journalist",
];

const baseFields = {
  pax_type: z.enum(["PERSON", "GROUP"]),
  pax_code: z.string(),
  free_of_charge: z.boolean(),
};

const allAgesPaxSchema = z.object({
  ...baseFields,
  all_ages: z.literal(true),
  age_from: z.number().nullish(),
  age_to: z.number().nullish(),
});

const specificAgesPaxSchema = z.object({
  ...baseFields,
  all_ages: z.literal(false),
  age_from: z.number().min(0).max(99),
  age_to: z.number().min(0).max(99),
});

function validateAgeRange(data: z.infer<typeof basePaxSchema>, ctx: z.RefinementCtx) {
  if (data.all_ages) return;

  if (data?.age_from > data?.age_to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Starting age must be less than or equal to ending age",
      path: ["age_from"],
    });
  }
}

// Function to check if two ranges overlap
function checkRangeOverlap(range1From: number, range1To: number, range2From: number, range2To: number): boolean {
  return (
    // Range 1 starts inside Range 2
    (range1From >= range2From && range1From <= range2To) ||
    // Range 1 ends inside Range 2
    (range1To >= range2From && range1To <= range2To) ||
    // Range 1 completely contains Range 2
    (range1From <= range2From && range1To >= range2To)
  );
}

const basePaxSchema = z.discriminatedUnion("all_ages", [allAgesPaxSchema, specificAgesPaxSchema]);
const schemaWithValidation = basePaxSchema.superRefine(validateAgeRange);
export const basePaxListSchema = z.array(schemaWithValidation).min(1, { message: "required" });

export const paxListSchema = basePaxListSchema.superRefine(validatePaxListOverlaps);
type PaxListSchema = z.infer<typeof basePaxListSchema>;

// Export the full schema with experience_id and pax_list
export const experiencePaxesSchema = z.object({
  experience_id: z.string(),
  pax_list: paxListSchema,
});

function validatePaxListOverlaps(paxList: PaxListSchema, ctx: z.RefinementCtx) {
  let hasOverlaps = false;
  if (!paxList.length) return;

  const filteredPaxList = paxList
    .filter((pax) => !pax.all_ages)
    .filter((pax) => !paxCodesToSkipOverlapCheck.includes(pax.pax_code));
  const originalIndexes = paxList.map((pax) => pax.pax_code);

  for (let i = 0; i < filteredPaxList.length; i++) {
    const pax = filteredPaxList[i];
    const paxIndex = originalIndexes.indexOf(pax.pax_code);

    for (let j = i + 1; j < filteredPaxList.length; j++) {
      const otherPax = filteredPaxList[j];
      const otherPaxIndex = originalIndexes.indexOf(otherPax.pax_code);

      // Check if the ranges overlap at all
      const overlaps = checkRangeOverlap(pax.age_from, pax.age_to, otherPax.age_from, otherPax.age_to);

      if (overlaps) {
        hasOverlaps = true;

        // Case 1: Check if pax completely contains otherPax
        const paxContainsOther = pax.age_from <= otherPax.age_from && pax.age_to >= otherPax.age_to;
        if (paxContainsOther) {
          // When a range completely contains another, highlight the containing range's age_from
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `contains "${otherPax.pax_code}" range`,
            path: [paxIndex, "age_from"],
          });
        }

        // Case 2: Check if otherPax completely contains pax
        const otherContainsPax = otherPax.age_from <= pax.age_from && otherPax.age_to >= pax.age_to;
        if (otherContainsPax) {
          // When a range completely contains another, highlight the containing range's age_from
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `contains "${pax.pax_code}" range`,
            path: [otherPaxIndex, "age_from"],
          });
        }

        // Case 3: Check if pax's age_from is inside otherPax's range
        if (pax.age_from >= otherPax.age_from && pax.age_from <= otherPax.age_to) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `overlaps with "${otherPax.pax_code}"`,
            path: [paxIndex, "age_from"],
          });
        }

        // Case 4: Check if pax's age_to is inside otherPax's range
        if (pax.age_to >= otherPax.age_from && pax.age_to <= otherPax.age_to) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `overlaps with "${otherPax.pax_code}"`,
            path: [paxIndex, "age_to"],
          });
        }

        // Case 5: Check if otherPax's age_from is inside pax's range
        if (otherPax.age_from >= pax.age_from && otherPax.age_from <= pax.age_to) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `overlaps with "${pax.pax_code}"`,
            path: [otherPaxIndex, "age_from"],
          });
        }

        // Case 6: Check if otherPax's age_to is inside pax's range
        if (otherPax.age_to >= pax.age_from && otherPax.age_to <= pax.age_to) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `overlaps with "${pax.pax_code}"`,
            path: [otherPaxIndex, "age_to"],
          });
        }
      }
    }
  }

  if (hasOverlaps) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "overlap",
      path: [],
    });
  }
}

export type PaxErrorsFromZod = ZodFormattedError<PaxListSchema>;
export type PaxErrorMap = Record<string, Record<string, string[]>> | null;

/**
 * Maps Zod validation errors to a more user-friendly format organized by pax code
 */
export function mapZodErrorsToPaxTypes(zodErrors: PaxErrorsFromZod, paxList: Pax[]): PaxErrorMap {
  if (isEmpty(zodErrors)) return null;

  const formattedErrors: PaxErrorMap = {};

  // Include root-level errors
  if (!isEmpty(zodErrors._errors)) {
    formattedErrors["pax_list"] = {
      errors: zodErrors._errors,
    };
  }

  // Process index-specific errors
  paxList.forEach((pax, index) => {
    const indexErrors = zodErrors[index as keyof typeof zodErrors];
    if (indexErrors && typeof indexErrors === "object" && "_errors" in indexErrors) {
      formattedErrors[pax.pax_code] = {};
      Object.entries(indexErrors).forEach(([field, error]) => {
        if (field !== "_errors" && error && "_errors" in error && Array.isArray((error as any)._errors)) {
          formattedErrors[pax.pax_code][field] = (error as any)._errors;
        }
      });
    }
  });

  return Object.keys(formattedErrors).length > 0 ? formattedErrors : null;
}
