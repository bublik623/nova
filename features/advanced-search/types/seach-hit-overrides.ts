/**
 * This file contains two types that replaces auto-generated types from the Content Query API.
 * This is needed since the code generator is typing `highlight_fields` property as `{}` and thus we'd be having errors like:
 * `Element implicitly has an 'any' type because expression of type '"property.key"' can't be used to index type '{}'. Property 'property.key' does not exist on type '{}'.`
 * each time we access it.
 */

import { DistributionContent, Raw } from "@/types/generated/ContentQueryApiV2";

/** Replace the automatically generated {@link RawSearchHit} within the module {@link @types/generated/ContentQueryApiV2/} */
export type TypedRawSearchHit = { content: Raw; highlight_fields?: MatchHighlight };
/** Replace the automatically generated {@link DistributionContentSearchHit} within the module {@link @types/generated/ContentQueryApiV2/} */
export type TypedDistributionContentSearchHit = {
  content: DistributionContent;
  highlight_fields?: PerLanguageMatchHighlight;
};
export type PerLanguageMatchHighlight = {
  [language: string]: MatchHighlight;
};
export type MatchHighlight = {
  [key: string]: string[];
};
