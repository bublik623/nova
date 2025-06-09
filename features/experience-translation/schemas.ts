import { string, z } from "zod";

export const translationHighlightSchema = z.object({
  name: string().min(1),
});

export const translationHighlightArraySchema = z.array(translationHighlightSchema).min(1).or(z.array(z.never()));

export const experienceTranslationSchema = z.object({
  title: string().min(1),
  seo_title: string().min(1),
  text1: string().min(1),
  seo_description: string().min(1),
  text2: string().optional(),
  info_voucher: string().optional(),
  custom_highlights: translationHighlightArraySchema,
  custom_important_information: translationHighlightArraySchema,
  custom_included: translationHighlightArraySchema,
  custom_non_included: translationHighlightArraySchema,
  // we don't have any validation for the premade
  premade_highlights: z.unknown(),
  premade_important_information: z.unknown(),
  premade_included: z.unknown(),
  premade_non_included: z.unknown(),
});

export type ExperienceTranslationSchema = z.infer<typeof experienceTranslationSchema>;
