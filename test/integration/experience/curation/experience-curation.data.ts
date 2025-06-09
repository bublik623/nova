import { RawElement } from "@/types/generated/ExperienceRawServiceApi";
import {
  ExperienceHighlights,
  ExperienceIncluded,
  ExperienceNonIncluded,
  ExperienceImportantInformation,
  ExperienceAdditionalService,
  ExperienceCategories,
  ExperienceInterests,
  ExperienceMarkets,
} from "@/types/generated/MetadataExperiencesApi";
import { ExperienceTranslation } from "@/types/generated/ContentCommandApi";
import { GenericHighlight } from "@/types/Highlights";
import { RefundPolicy } from "@/types/generated/OfferServiceApiOld";
import { Pax } from "@/types/generated/OfferServiceApi";

export interface MetaData {
  highlights: ExperienceHighlights;
  included: ExperienceIncluded;
  nonIncluded: ExperienceNonIncluded;
  importantInfo: ExperienceImportantInformation;
  additionalServices: ExperienceAdditionalService;
  categories: ExperienceCategories;
  interests: ExperienceInterests;
  markets: ExperienceMarkets;
}

export const rawContent: RawElement = {
  id: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
  experience_id: "mock-experience-id",
  commercial: {
    title: "Deleniti inventore nihil ut ipsum modi cupiditate iusto non.",
    description: "connecting the interface won't do anything",
    additional_description: "connecting the interface won't do anything",
    meeting_point_details: "meeting point text added text",
    custom_highlights: [
      {
        name: "My custom highlight 2",
        code: "custom-highlight-2",
      },
      {
        name: "custom diff 1",
        code: "custom-diff-1",
      },
    ],
    custom_included: [
      {
        name: "My custom highlight 1",
      },
      {
        name: "My custom highlight 2",
      },
    ],
    custom_non_included: [
      {
        name: "My custom highlight 1",
      },
      {
        name: "My custom highlight 2",
      },
    ],
    custom_important_information: [
      {
        name: "My custom highlight 1",
      },
      {
        name: "My custom highlight 2",
      },
    ],
    info_voucher: "updated voucher info",
  },
  functional: {
    asterix_id: "asterix id",
    highlights: ["LUNCHMENU", "DINNERMENU", "DIFF-PREMADE-ADDED"],
    included: ["ENTRANCEFEES", "DRINKS"],
    non_included: ["ENTRANCEFEES", "DRINKS"],
    important_information: ["COPYPASS", "SHOES"],
    categories: ["ACTIVITIES"],
    interests: ["AIR_ACTIVITIES", "FOOD_AND_DRINK"],
    additional_services: [
      "BRAND_TUI_COLLECTION",
      "OWN_OFFER_TUI_DESIGNED_OPERATED",
      "PROMOTIONAL_SELL_OUT",
      "DURATION_6_8",
    ],
  },
  creation_date: "2022-06-24T14:54:23.115",
  updated_date: "2022-08-09T08:42:18.127",
  flow_code: "BASE",
  status_code: "IN_CREATION",
  collection_criteria: {
    best_value_guaranteed: "test best value guaranteed",
    created_with_care: "test created with care",
    exceptional_experiences: "test exceptional experiences",
  },
};

export const experienceMetadata: MetaData = {
  highlights: {
    id: "id-highlights",
    experience_id: "test-id",
    highlights: ["LUNCHMENU", "DINNERMENU"],
    language_code: "en",
  },
  included: {
    id: "id-included",
    experience_id: "test-id",
    included: rawContent.functional?.included || [],
    language_code: "en",
  },
  nonIncluded: {
    id: "id-non-included",
    experience_id: "test-id",
    non_included: rawContent.functional?.non_included || [],
    language_code: "en",
  },
  importantInfo: {
    id: "id-important-info",
    experience_id: "test-id",
    important_information: rawContent.functional?.important_information || [],
    language_code: "en",
  },
  additionalServices: {
    id: "id-additional-services",
    experience_id: "test-id",
    additional_services: [
      "BRAND_TUI_COLLECTION",
      "OWN_OFFER_TUI_DESIGNED_OPERATED",
      "PROMOTIONAL_NONE",
      "FEATURE_KIDS_FREE",
      "DURATION_UP_2",
    ],
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
  markets: {
    id: "test-market",
    experience_id: "test-id",
    markets: ["de-2c", "3p-nz", "bo-2b"],
  },
};

export const editorialContent: ExperienceTranslation = {
  language_code: "en",
  id: "id-translation-en",
  title: "Deleniti inventore nihil ut ipsum modi cupiditate iusto non.",
  seo_title: "",
  meeting_point_details: "meeting point text",
  text1: "diff description",
  text2: "diff additional description",
  seo_description: "",
  info_voucher: "test info voucher",
  experience_id: "test-id",
  status_code: "TO_BE_EDIT",
  flow_code: "CURATION",
  creation_date: "2022-06-24T14:54:23.115",
  updated_date: "2022-08-09T08:42:18.127",
};

export const customOptions: GenericHighlight[] = [
  {
    id: "462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7",
    name: "My custom highlight 1",
    language_code: "en",
    visualization_order: 0,
  },
  {
    id: "fde07d18-22d5-4b25-8699-56227c5abecb",
    name: "My custom highlight 2",
    language_code: "en",
    visualization_order: 1,
  },
];

export const offerServiceExperience = {
  type: "CALENDAR-TIMESLOTS",
  confirmation_time: "P0D",
  cutoff_time: "P0D",
  supplier: "test-supplier-id",
  state: "DRAFT",
  currency: "EUR",
};

export const mockCurationOptionsData = [
  {
    id: "test-option-id-1",
    name: "TEST OPTION NOVA 1",
    multilanguage: true,
    capacity_type: "unlimited",
    duration: "P0Y1DT2H3M0S",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    pricing_type_allowed: "person",
  },
  {
    id: "test-option-id-2",
    name: "TEST OPTION NOVA 2",
    multilanguage: true,
    capacity_type: "unlimited",
    duration: "P0Y1DT2H3M0S",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    pricing_type_allowed: "person",
  },
  {
    id: "test-option-id-3",
    name: "TEST OPTION NOVA 3",
    multilanguage: true,
    capacity_type: "limited",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    pricing_type_allowed: "person",
  },
];

export const mockOfferServiceDateTimeTicket = [
  {
    id: "30ab4a5b-4b30-4b31-a753-1170f183e599",
    option: "3a32c96e-79bc-4b38-bf8c-c87f2fa34e28",
    name: "availability-name",
    date_range: {
      from: "2022-12-29",
      to: "2023-01-02",
    },
    days: {
      "1": [
        {
          time: "12:00:00",
          capacity: 0,
          languages: [
            {
              language: "string",
            },
          ],
          pricings: [
            {
              pricing: "4b6a0728-6289-4048-b421-de51f5a0342e",
            },
          ],
        },
      ],
      "2": [
        {
          time: "12:00:00",
          capacity: 0,
          languages: [
            {
              language: "string",
            },
          ],
          pricings: [
            {
              pricing: "4b6a0728-6289-4048-b421-de51f5a0342e",
            },
          ],
        },
      ],

      "5": [
        {
          time: "12:00:00",
          capacity: 0,
          languages: [
            {
              language: "string",
            },
          ],
          pricings: [
            {
              pricing: "4b6a0728-6289-4048-b421-de51f5a0342e",
            },
          ],
        },
      ],
      "6": [
        {
          time: "12:00:00",
          capacity: 0,
          languages: [
            {
              language: "string",
            },
          ],
          pricings: [
            {
              pricing: "4b6a0728-6289-4048-b421-de51f5a0342e",
            },
          ],
        },
      ],
    },
  },
];

export const mockCurationPricingData = [
  {
    id: "3a32c96e-79bc-4b38-bf8c-c87f2fa34e28",
    name: "TEST NOVA PRICING 1",
    holder: "adult",
    age_range: {
      from: 0,
      to: 99,
    },
    option: "test-option-id",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 18.75,
        commission: 5,
        net_price: 17.81,
      },
    ],
  },
  {
    id: "3a749bd8-65ce-4cd6-8943-e6589fdf9251",
    name: "TEST NOVA PRICING 1",
    holder: "senior",
    age_range: {
      from: 0,
      to: 99,
    },
    option: "test-option-id",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 18.75,
        commission: 5,
        net_price: 17.81,
      },
    ],
  },
  {
    id: "4deb70d2-22ee-4f8b-80f6-668ba899e0e6",
    name: "TEST NOVA PRICING 1",
    holder: "child",
    age_range: {
      from: 0,
      to: 99,
    },
    option: "test-option-id",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 18.75,
        commission: 5,
        net_price: 17.81,
      },
    ],
  },
];

export const mockRefundPolicies: RefundPolicy[] = [
  {
    id: "refund-policy-1",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    period: "P5D",
    refund_type_code: "PERCENTAGE",
    value: 100,
  },
  {
    id: "refund-policy-2",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    period: "P2D",
    refund_type_code: "PERCENTAGE",
    value: 80,
  },
  {
    id: "refund-policy-3",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    period: "P1D",
    refund_type_code: "PERCENTAGE",
    value: 50,
  },
];

export const mockPickups = [
  {
    id: "pickup-1",
    pickup_place_ids: ["id1", "id2"],
  },
];

export const mockPickupPlaces = [
  {
    id: "id1",
    name: "place1",
    address: "address1",
  },
  {
    id: "id2",
    name: "place2",
    address: "address2",
  },
];

export const mockExperiencePaxTypes: Pax[] = [
  {
    pax_code: "adult",
    pax_type: "PERSON",
    all_ages: false,
    age_from: 20,
    age_to: 30,
    free_of_charge: false,
  },
  {
    pax_code: "child",
    pax_type: "PERSON",
    all_ages: false,
    age_from: 0,
    age_to: 1,
    free_of_charge: false,
  },
  {
    pax_code: "infant",
    pax_type: "PERSON",
    all_ages: false,
    age_from: 2,
    age_to: 3,
    free_of_charge: false,
  },
  {
    pax_code: "youth",
    pax_type: "PERSON",
    all_ages: false,
    age_from: 5,
    age_to: 15,
    free_of_charge: false,
  },
];
