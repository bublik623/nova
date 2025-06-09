import { z } from "zod";
import { Option } from "@/types/Option";

export type AdvancedFilterTypes = "date-range" | "multiselect";

/**
 * Represents the configuration of a single Date Range Filter in the Advanced Search Filter Panel
 */
export type AdvancedFilterDateRangeConfig = {
  type: "date-range";
  key: string;
  label: string;
};

/**
 * Represents the configuration of a single Multiselect Filter in the Advanced Search Filter Panel
 */
export type AdvancedFilterMultiselectConfig = {
  type: "multiselect";
  key: string;
  label: string;
  options: Option[];
  defaultValue?: Option[];
};

/**
 * Represents the configuration of a Section in the Advanced Search Filter Panel
 */
export type AdvancedFiltersConfig = AdvancedFilterDateRangeConfig | AdvancedFilterMultiselectConfig;

export type AdvancedFilterSectionsConfig = {
  mostUsedFiltersConfig: AdvancedFiltersConfig[];
  moreFiltersConfig: AdvancedFiltersConfig[];
};

export const advancedFilterDateRangeSchema = z.object({
  type: z.literal("date-range"),
  value: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
});

export const advancedFilterMultiselectSchema = z.object({
  type: z.literal("multiselect"),
  isDefaultValue: z.boolean(),
  value: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

export const advancedFilterValueSchema = z.union([advancedFilterDateRangeSchema, advancedFilterMultiselectSchema]);

export type AdvancedFilterMultiselectValue = z.infer<typeof advancedFilterMultiselectSchema>;
export type AdvancedFilterDateRangeValue = z.infer<typeof advancedFilterDateRangeSchema>;
export type AdvancedFilterValue = z.infer<typeof advancedFilterValueSchema>;

/**
 * Represent a set of filter value.
 * The key is the filter key.
 * The value correspond to the value of the filter identified by the key.
 */
export type AdvancedFiltersValues = Record<string, AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue>;

export type RawFilterKeys =
  | "lastModificationDate"
  | "status"
  | "city"
  | "country"
  | "supplier"
  | "markets"
  | "creationDate";
export type EditorialFilterKeys =
  | "publicationDate"
  | "status"
  | "city"
  | "country"
  | "language"
  | "supplier"
  | "markets";
