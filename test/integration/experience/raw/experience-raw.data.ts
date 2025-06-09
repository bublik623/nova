import { Currency } from "@/types/generated/ContractMasterDataApi";
import {
  AsxExperience,
  DistributionContent,
  MediaSnapshot,
  ModalityCodes,
  RawElement,
  RawSnapshot,
  Snapshot,
} from "@/types/generated/ExperienceRawServiceApi";
import { RefundPolicy } from "@/types/generated/OfferServiceApiOld";
import { CapacityType } from "@/types/Options";
import { mockLocationData } from "./location/location.data";
import { mockBookingInfo } from "./customer-info/customer-info.data";
import { BRAND_NATIONAL_GEOGRAPHIC } from "@/features/experience-raw/constants";
import { cloneDeep } from "lodash";
import { ExperiencePaxes } from "@/types/generated/OfferServiceApi";

export const mockDistributionContentWithSupplierId: DistributionContent = {
  id: "f414ee19-a194-4e96-9785-3d08cc6f086a",
  supplier_id: "test-supplier-id",
  curation_level: "DEDICATED",
  priority: 1,
  reference_code: "EXP0000001",
  experience_source: "NOVA",
};

export const rawContentProductTypeNova: RawElement = {
  id: "mock-raw-id",
  experience_id: "mock-experience-id",
  commercial: {
    title: "Deleniti inventore nihil ut ipsum modi cupiditate iusto non.",
    description: "connecting the interface won't do anything, we need to program the mobile SDD pixel!",
    additional_description: "connecting the interface won't do anything, we need to program the mobile SDD pixel!",
    custom_highlights: [
      {
        name: "My custom highlight 1",
      },
      {
        name: "My custom highlight 2",
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
  },
  functional: {
    external_reference_code: "test short reference code",
    options: [{ code: "TEST-OPTION", description: "" }],
    asterix_id: "asterix id",
    highlights: ["LUNCHMENU", "DINNERMENU"],
    included: ["ENTRANCEFEES", "DRINKS"],
    non_included: ["ENTRANCEFEES", "DRINKS"],
    important_information: ["COPYPASS", "SHOES"],
    additional_services: [
      BRAND_NATIONAL_GEOGRAPHIC,
      "OWN_OFFER_TUI_DESIGNED_OPERATED",
      "PROMOTIONAL_SELL_OUT",
      "DURATION_6_8",
      "NAT_GEO_TOUR_LEVEL_ENTRY",
    ],
    categories: ["BOAT_TRIPS"],
    interests: ["BIKE", "GOLF"],
    markets: ["de-2c", "3p-nz", "bo-2b"],
    location: mockLocationData,
    booking_information: mockBookingInfo[0].booking_information,
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

export const distributionContentProductTypeAsterix: DistributionContent = {
  ...cloneDeep(mockDistributionContentWithSupplierId),
  experience_source: "ASX",
};

export const distributionContentProductTypeSip: DistributionContent = {
  ...cloneDeep(mockDistributionContentWithSupplierId),
  experience_source: "SIP",
};

export const rawContentProductTypeAsterix: RawElement = {
  ...cloneDeep(rawContentProductTypeNova),
  legacy_adapter_information: {
    asx_codes: [
      { code: "SVC-1", modality_codes: ["MOD-1", "MOD-2"] },
      { code: "SVC-2", modality_codes: ["MOD-3", "MOD-4"] },
    ],
  },
};

export const mockRawOptionsData = [
  {
    id: "test-option-id-1",
    name: "TEST OPTION NOVA 1",
    multilanguage: true,
    capacity_type: "unlimited",
    duration: "P0Y1DT2H3M0S",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    status: "PUBLISHED",
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

export const mockRawPricingData = [
  {
    id: "4a60d96b-adee-42ae-917b-f84d098546f2",
    name: "My pricing 1",
    holder: "adult",
    pricing_type: "person",
    age_range: {
      from: 20,
      to: 30,
    },
    option: "4844fd2c-bbd0-40ea-a742-f6af05dad345",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 20,
        commission: 10,
        net_price: 18,
      },
    ],
  },
  {
    id: "51519f27-5856-4e46-a259-d920eb7633d6",
    name: "My pricing 2",
    holder: "child",
    pricing_type: "person",
    age_range: {
      from: 0,
      to: 1,
    },
    option: "4844fd2c-bbd0-40ea-a742-f6af05dad345",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 20,
        commission: 10,
        net_price: 18,
      },
    ],
  },
  {
    id: "69b97ac1-bed5-4dd2-ae49-2d22cb25c969",
    name: "My pricing 3",
    pricing_type: "person",
    holder: "infant",
    age_range: {
      from: 2,
      to: 3,
    },
    option: "4844fd2c-bbd0-40ea-a742-f6af05dad345",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 20,
        commission: 10,
        net_price: 18,
      },
    ],
  },
  {
    id: "d262062d-bde6-4c11-819f-3fa55b6a9ed6",
    name: "My pricing 4",
    pricing_type: "person",
    holder: "youth",
    age_range: {
      from: 5,
      to: 15,
    },
    option: "4844fd2c-bbd0-40ea-a742-f6af05dad345",
    tiers: [
      {
        from: 1,
        to: 10,
        retail_price: 10,
        commission: 10,
        net_price: 9,
      },
    ],
  },
];

export const mockOfferServiceExperience = {
  uuid: "6a64b363-9c5f-4824-b4d5-124ae908eca5",
  type: "CALENDAR-TIMESLOTS",
  confirmation_time: "P0Y0M0DT0H0M0S",
  cutoff_time: "P0Y0M0DT0H0M0S",
  supplier: "test-supplier-id",
  state: "DRAFT",
  currency: "EUR",
};
export const mockOfferServiceDateTimeTicket = [
  {
    id: "30ab4a5b-4b30-4b31-a753-1170f183e599",
    option: "3a32c96e-79bc-4b38-bf8c-c87f2fa34e28",
    name: "Second availability",
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
  {
    id: "5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a",
    option: "3a32c96e-79bc-4b38-bf8c-c87f2fa34e28",
    name: "availability-name",
    date_range: {
      from: "2021-01-05",
      to: "2021-01-10",
    },
    days: {
      "4": [
        {
          time: "10:00:00",
          capacity: 20,
          languages: [
            {
              language: "en",
            },
          ],
          pricings: [
            {
              pricing: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
            },
          ],
        },
      ],
    },
  },
  {
    id: "5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a",
    option: "3a32c96e-79bc-4b38-bf8c-c87f2fa34e28",
    name: "Another availability name",
    date_range: {
      from: "2024-01-05",
      to: "2024-04-10",
    },
    days: {
      "5": [
        {
          time: "10:00:00",
          capacity: 20,
          languages: [
            {
              language: "en",
            },
          ],
          pricings: [
            {
              pricing: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
            },
          ],
        },
      ],
    },
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

export const mockSlots = [
  {
    id: "12345",
    experience_id: "456",
    timeslice_id: "78910",
    aggregation_id: "abcd",
    date: "2022-01-02",
    type: "standard",
    option: {
      id: "option-1",
      name: "First Option",
      capacity_type: CapacityType.PAX,
    },
    pricing: {
      holder: "Holder Name",
      age_range: { min: 18, max: 99 },
    },
    total_capacity: 10,
    remaining_capacity: 5,
    bookings: 2,
    time: "10:00:00",
    enabled: true,
    status: "ACTIVE",
  },
  {
    id: "123",
    experience_id: "456",
    timeslice_id: "789",
    aggregation_id: "abc",
    date: "2022-01-01",
    type: "standard",
    option: {
      id: "option-1",
      name: "First Option",
      capacity_type: CapacityType.PAX,
    },
    pricing: {
      holder: "Holder Name",
      age_range: { min: 18, max: 99 },
    },
    total_capacity: 10,
    remaining_capacity: 5,
    bookings: 2,
    time: "09:00:00",
    enabled: true,
    status: "ACTIVE",
  },
  {
    id: "1234",
    experience_id: "456",
    timeslice_id: "789",
    aggregation_id: "abc",
    date: "2022-01-01",
    type: "standard",
    option: {
      id: "option-2",
      name: "Second Option",
      capacity_type: CapacityType.UNLIMITED,
    },
    pricing: {
      holder: "Holder Name",
      age_range: { min: 18, max: 99 },
    },
    total_capacity: 10,
    remaining_capacity: 5,
    bookings: 2,
    time: "09:00:00",
    enabled: true,
    status: "ACTIVE",
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

export const mockSuppliers = [
  {
    id: "test-supplier-id",
    source: "nova source",
    name: "nova test supplier",
    email: "test@example.com",
    commission: 1.5,
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    source: "BP",
    name: "Musement",
    email: "Musement@tui.com",
    commission: 25.2,
  },
];

export const mockCurrencies: Partial<Currency>[] = [
  { id: "1", name: "USD", code: "USD", symbol: "$" },
  { id: "2", name: "EUR", code: "EUR", symbol: "€" },
];

export const mockRawSnapshot: RawSnapshot = {
  id: "1",
  raw: {
    flow_code: "BASE",
    experience_id: "mock-exp-id",
    status_code: "UP_TO_DATE",
    commercial: {
      title: "Deleniti inventore nihil ut ipsum modi cupiditate iusto text should be removed.",
      info_voucher: "original voucher info",
      description: "removed text connecting the interface",
      additional_description: "removed text connecting the interface",
      meeting_point_details: "removed text meeting point text",
      custom_highlights: [
        {
          name: "My custom highlight 1",
          code: "custom-high-1",
        },
        {
          name: "My custom highlight 2",
          code: "custom-high-2",
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
    },
    functional: {
      highlights: ["LUNCHMENU", "DINNERMENU", "DIFF-PREMADE-REMOVED"],
      included: ["ENTRANCEFEES", "DRINKS"],
      non_included: ["ENTRANCEFEES", "DRINKS"],
      important_information: ["COPYPASS", "SHOES"],
      categories: ["ACTIVITIES"],
      interests: ["AIR_ACTIVITIES", "FOOD_AND_DRINK"],
    },
  },
};

export const mockTranslationSnapshotData: Snapshot = {
  id: "test_snapshot_id_1",
  reference_code: "test short reference code",
  experience_id: "1",
  experience_commercial_information: {
    experience_media: {
      id: "1",
      flow_code: "BASE",
      status_code: "UP_TO_DATE",
      images: [],
    },
    translations: [
      {
        language_code: "en",
        experience_translation: {
          id: "1",
          title: "Test ",
          text1: "Test ",
          text2: "test ",
          text3: "test ",
          seo_title: "SEO test title ",
          seo_description: "SEO Description for Experience",
          info_voucher: "test ",
          meeting_point_details: "test ",
          flow_code: "BASE",
          status_code: "BEING_CURATED",
          name: "Sample Experience",
        },
      },
    ],
  },
};

export const mockMediaSnapshotData: MediaSnapshot = {
  id: "test_snapshot_id_1",
  experience_id: "1",
  media: {
    id: "1",
    flow_code: "BASE",
    status_code: "UP_TO_DATE",
    images: [],
  },
};

export const mockAsterixServices: Array<AsxExperience> = [
  { code: "SVC-1", default_name: "Asterix Service 1" },
  { code: "SVC-2", default_name: "Asterix Service 2" },
  { code: "SVC-3", default_name: "Asterix Service 3" },
];

export const mockAsterixModalities: Map<string, Array<ModalityCodes>> = new Map([
  [
    "SVC-1",
    [
      { code: "MOD-1", default_name: "Asterix Modality 1" },
      { code: "MOD-2", default_name: "Asterix Modality 2" },
    ],
  ],
  [
    "SVC-2",
    [
      { code: "MOD-3", default_name: "Asterix Modality 3" },
      { code: "MOD-4", default_name: "Asterix Modality 4" },
    ],
  ],
  [
    "SVC-3",
    [
      { code: "MOD-5", default_name: "Asterix Modality 5" },
      { code: "MOD-6", default_name: "Asterix Modality 6" },
    ],
  ],
]);

export const mockApiEvents = [
  {
    id: "9c76fe98-8e76-4c46-ac64-2ad8926a7933",
    sip_id: "sip-id-1",
    supplier_id: "supplier-id-1",
    sip_name: "Iceland Travel: NO-ID Mandatory Questions for some Holders",
    linked: true,
    reference_code: "EXP0055617",
    experience_id: "d346b6ab-7917-4629-81b2-ed58efa97cdf",
  },
  {
    id: "9c76fe98-8e76-4c46-ac64-2ad8926a7933",
    sip_id: "sip-id-2",
    supplier_id: "supplier-id-1",
    sip_name: "Iceland Travel: NO-ID Mandatory Questions for some Holders",
  },
];

export const mockExperiencePaxes: ExperiencePaxes = {
  experience_id: "mock-experience-id",
  pax_list: [
    {
      pax_code: "adult",
      pax_type: "PERSON",
      all_ages: false,
      age_from: 20,
      age_to: 30,
      free_of_charge: false,
    },
  ],
};
