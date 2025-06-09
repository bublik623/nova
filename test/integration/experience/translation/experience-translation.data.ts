import { CustomHighlights, ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import {
  ExperienceHighlights,
  ExperienceIncluded,
  ExperienceNonIncluded,
  ExperienceImportantInformation,
  ExperienceAdditionalService,
  ExperienceCategories,
  ExperienceInterests,
} from "@/types/generated/MetadataExperiencesApi";

interface MetaData {
  highlights: ExperienceHighlights;
  included: ExperienceIncluded;
  nonIncluded: ExperienceNonIncluded;
  importantInfo: ExperienceImportantInformation;
  additionalServices: ExperienceAdditionalService;
  categories: ExperienceCategories;
  interests: ExperienceInterests;
}

export const translations: {
  [lang: string]: ExperienceTranslation;
} = {
  en: {
    language_code: "en",
    id: "id-translation-en",
    title: "English title",
    seo_title: "English",
    text1: "English description",
    seo_description: "English seo description",
    text2: "English additional description",
    info_voucher: "English voucher",
    experience_id: "ad0ef787-7ca2-410b-9648-7cf80f1e0b46",
    status_code: "READY",
    flow_code: "CURATION",
    creation_date: "2022-06-24T14:54:23.115",
    updated_date: "2022-08-09T08:42:18.127",
    meeting_point_details: "English",
  },
  es: {
    language_code: "es",
    id: "id-translation-es",
    title: "Spanish title",
    seo_title: "",
    text1: "Spanish description",
    seo_description: "Spanish seo description",
    text2: "Spanish additional description",
    info_voucher: "Spanish voucher",
    experience_id: "ad0ef787-7ca2-410b-9648-7cf80f1e0b46",
    status_code: "TO_BE_EDIT",
    flow_code: "MANUAL_TRANSLATION",
    creation_date: "2022-06-24T14:54:23.115",
    updated_date: "2022-08-09T08:42:18.127",
    meeting_point_details: "Spanish meeting details",
  },
};

export const experienceMetadata: MetaData = {
  highlights: {
    id: "id-highlights",
    experience_id: "test-id",
    highlights: ["LUNCHMENU"],
    language_code: "en",
  },
  included: {
    id: "id-included",
    experience_id: "test-id",
    included: ["ENTRANCEFEES"],
    language_code: "en",
  },
  nonIncluded: {
    id: "id-non-included",
    experience_id: "test-id",
    non_included: ["LUNCH"],
    language_code: "en",
  },
  importantInfo: {
    id: "id-important-info",
    experience_id: "test-id",
    important_information: ["COPYPASS"],
    language_code: "en",
  },
  additionalServices: {
    id: "id-additional-services",
    experience_id: "test-id",
    additional_services: ["7c531efc-ec15-45e2-a9be-3e9a2fbe0864"],
    language_code: "en",
  },
  categories: {
    id: "id-categories",
    experience_id: "test-id",
    categories: ["ACTIVITIES"],
  },
  interests: {
    id: "id-categories",
    experience_id: "test-id",
    interests: ["AIR_ACTIVITIES", "FOOD_AND_DRINK"],
  },
};

export const customOptions: CustomHighlights[] = [
  {
    creation_date: "2022-09-14T14:33:44.240467",
    updated_date: "2022-09-22T11:03:43.841963",
    id: "fde07d18-22d5-4b25-8699-56227c5abecb",
    experience_id: "66daa9a7-6e30-45a2-bf20-e1f3f1957e56",
    language_code: "en",
    name: "Rename!",
    automatic_translation: false,
    to_be_translated: false,
    visualization_order: 0,
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
  },
  {
    creation_date: "2022-09-14T14:34:43.485704",
    updated_date: "2022-09-22T11:03:43.861729",
    id: "462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7",
    experience_id: "66daa9a7-6e30-45a2-bf20-e1f3f1957e56",
    language_code: "en",
    name: "testing auto save",
    automatic_translation: false,
    to_be_translated: false,
    visualization_order: 1,
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
  },
  {
    creation_date: "2022-09-22T09:49:18.946007",
    updated_date: "2022-09-22T11:03:43.729803",
    id: "46bf2812-4045-4dbf-8208-2726798ce9a8",
    experience_id: "66daa9a7-6e30-45a2-bf20-e1f3f1957e56",
    language_code: "en",
    name: "Hey",
    automatic_translation: false,
    to_be_translated: false,
    visualization_order: 2,
    flow_code: "MANUAL_TRANSLATION",
    status_code: "TO_BE_EDIT",
  },
];

export const offerServiceExperience = {
  type: "CALENDAR-TIMESLOTS",
  confirmation_time: "P0D",
  cutoff_time: "P0D",
  supplier: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  state: "DRAFT",
  currency: "EUR",
};
