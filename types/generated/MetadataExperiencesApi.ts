"use strict";
export type Error = { code?: string; message?: string };
export type ExperienceSustainability = {
  id?: string;
  experience_id: string;
  language_code: string;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
  sustainability: Array<
    | "ANIMAL_WELFARE"
    | "LOCAL_FOOD"
    | "CHARITY"
    | "ACCESSIBILITY"
    | "ENVIRONMENTAL"
    | "LOCAL_PRODUCTS"
    | "HISTORICAL_SITE"
    | "NATURAL_AREA"
    | "SUSTAINABLE_TRANSPORT"
  >;
};
export type ExperienceHighlights = {
  id?: string;
  experience_id: string;
  language_code: string;
  highlights: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceIncluded = {
  id?: string;
  experience_id: string;
  language_code: string;
  included: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceNonIncluded = {
  id?: string;
  experience_id: string;
  language_code: string;
  non_included: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceImportantInformation = {
  id?: string;
  experience_id: string;
  language_code: string;
  important_information?: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceBookingInformation = {
  id?: string;
  experience_id: string;
  booking_information: BookingInformation;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type BookingInformation = {
  emergency_contact_number?: ContactNumber;
  voucher_type: "MOBILE" | "PRINTED";
};
export type ContactNumber = { country_calling_code: string; number: string };
export type ExperienceAdditionalService = {
  id?: string;
  experience_id: string;
  language_code: string;
  additional_services: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type BookingQuestion = {
  booking_question_code: string;
  is_mandatory: boolean;
  is_apply_all: boolean;
  visualization_order?: number;
};
export type ExperienceBookingQuestions = {
  id: string;
  experience_id: string;
  option_id: string;
  booking_questions: Array<BookingQuestion>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceCategories = {
  id?: string;
  experience_id: string;
  categories: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceLocation = {
  id?: string;
  experience_id: string;
  option_id?: string;
  latitude?: string;
  longitude?: string;
  altitude?: string;
  name?: string;
  address: Address;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type Address = {
  direction?: string;
  city: string;
  postal_code?: string;
  country: string;
};
export type ExperienceInterests = {
  id?: string;
  experience_id: string;
  interests: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceMarkets = {
  id?: string;
  experience_id: string;
  markets: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceAdditionalCities = {
  id?: string;
  experience_id: string;
  additional_cities: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type ExperienceVenues = {
  id?: string;
  experience_id: string;
  venues: Array<string>;
  creation_date?: CreationDate;
  updated_date?: UpdatedDate;
};
export type CreationDate = string;
export type UpdatedDate = string;
