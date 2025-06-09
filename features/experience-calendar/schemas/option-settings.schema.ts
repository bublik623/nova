import { z, SuperRefinement } from "zod";
import { Option } from "@/types/generated/OfferServiceApi";

// when language field is true, allowed_languages is required
const validateAllowedLanguages: SuperRefinement<Option> = (data, ctx) => {
  if (data.multilanguage) {
    if (!data.allowed_languages?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one language must be selected",
        path: ["allowed_languages"],
      });
    }
  }
};

export const optionsSettingSchema = z
  .object({
    experience: z.string(),
    name: z.string().min(2),
    duration: z.string().min(2),
    multilanguage: z.boolean(),
    capacity_type: z.enum(["unlimited", "shared", "pax", "language"]),
    pricing_type_allowed: z.enum(["person", "group"]),
    allowed_languages: z.array(z.object({ language: z.string() })).optional(),
  })
  .superRefine(validateAllowedLanguages);

export type OptionsSettingSchema = z.infer<typeof optionsSettingSchema>;
