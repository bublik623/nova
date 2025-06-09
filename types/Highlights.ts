import { ManageableItem } from "./ManageableItems";

export type HighlightsKey = "highlights" | "important_information" | "included" | "non_included";

export type HighlightsMasterDataKey = "highlights" | "importantInformation" | "included";

export type CustomHighlightsKey =
  | "custom_highlights"
  | "custom_important_information"
  | "custom_included"
  | "custom_non_included";

export type CustomHighlightsEndpoint =
  | "custom-highlights"
  | "custom-important-information"
  | "custom-included"
  | "custom-non-included";

export interface GenericHighlight extends ManageableItem {
  code?: string;
  description?: string;
  language_code?: string;
}

export interface MixedHighlightValue {
  custom: GenericHighlight[];
  premade: GenericHighlight[];
}
