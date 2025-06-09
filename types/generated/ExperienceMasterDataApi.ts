"use strict";
export type Error = { code?: string; message?: string };
export type Category = {
  id: string;
  code: string;
  name: string;
  description?: string;
  language_code: string;
  core_code?: string;
};
export type Included = {
  id: string;
  code: string;
  hierarchical_group_code?: string;
  name: string;
  description?: string;
  language_code: string;
};
export type Highlights = {
  id: string;
  code: string;
  hierarchical_group_code?: string;
  name: string;
  description?: string;
  language_code: string;
};
export type ImportantInformationRequest = ImportantInformation | CommercialContentPreMade;
export type HighlightsRequest = Highlights | CommercialContentPreMade;
export type IncludedRequest = Included | CommercialContentPreMade;
export type ImportantInformation = {
  id: string;
  code: string;
  hierarchical_group_code?: string;
  name: string;
  description?: string;
  language_code: string;
};
export type CommercialContentPreMade = {
  items: Array<CommercialContentPreMadeItem>;
  manualLanguages?: Array<string>;
  automaticLanguages?: Array<string>;
};
export type CommercialContentPreMadeItem = {
  code: string;
  hierarchicalGroupCode?: string;
  name: string;
  description?: string;
  languageCode: string;
};
export type Interest = {
  id: string;
  code: string;
  name: string;
  description?: string;
  language_code: string;
  core_code?: string;
  olp_code?: string;
};
export type ExperienceStatus = {
  id: string;
  name: string;
  description?: string;
};
export type ExperienceType = { id: string; name: string; description?: string };
export type CapacityType = { id: string; name: string; description?: string };
export type OptionStatus = { id: string; name: string; description?: string };
export type Holder = {
  id: string;
  name: string;
  language_code: string;
  description?: string;
  isAgeRequired?: boolean;
};
export type Pax = {
  id: string;
  name: string;
  type: "PERSON" | "GROUP";
  language_code: string;
  description: string;
  all_ages?: boolean;
  age_from?: number;
  age_to?: number;
  free_of_charge?: boolean;
};
export type OptionLanguage = { id: string; name: string; description?: string };
export type AdditionalService = {
  id: string;
  code: string;
  name: string;
  description?: string;
  language_code: string;
  functional_group_code?: string;
  hierarchical_group_code?: string;
  core_code?: string;
  olp_code?: string;
  core_category?: "flavour" | "feature" | "service";
};
export type HierarchicalGroup = {
  id: string;
  language_code: string;
  code: string;
  name: string;
  description?: string;
  parent_code?: string;
};
export type OptionName = {
  id: string;
  name: string;
  language_code: string;
  description?: string;
};
export type PricingType = { id: string; name: string; description?: string };
export type Group = { id: string; name: string; description?: string };
export type Market = {
  id: string;
  language_code: string;
  code: string;
  name: string;
  description?: string;
  category: string;
};
export type PreMadeTranslation = {
  code: string;
  languages: Array<TranslationLanguage>;
};
export type TranslationLanguage = {
  language_code: string;
  to_be_translated: boolean;
};
export type BookingQuestion = {
  id: string;
  code: string;
  question: string;
  is_personal_information: boolean;
  placeholder?: string;
  answer_type: "TEXT" | "PARAGRAPH" | "RADIO" | "DATE" | "DROPDOWN" | "TIME" | "NUMBER";
  description?: string;
  options?: Array<string>;
  language_code: string;
  apply_policy: "BOOKING" | "CONFIGURABLE" | "PARTICIPANT";
  category: "MAIN" | "DATETIME" | "PERSONAL" | "TRAVEL" | "EXTRA";
};
