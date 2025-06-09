import { Pax } from "@/types/generated/OfferServiceApi";
import { DateTicket, Experience, ExperienceType } from "@/types/generated/OfferServiceApiOld";

export const mockGroupPricingData = [
  {
    id: "4a60d96b-adee-42ae-917b-f84d098546f2",
    name: "My pricing 1",
    holder: "group",
    pricing_type: "group",
    age_range: {
      from: 0,
      to: 99,
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
];

export const mockPricingData = [
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

export const mockOptionData = {
  id: "test-option-id-1",
  name: "TEST OPTION NOVA 1",
  multilanguage: true,
  capacity_type: "unlimited",
  duration: "P0Y1DT2H3M0S",
  experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
  pricing_type_allowed: "person",
};

export const mockOfferExperience: Experience = {
  confirmation_time: "P0Y0M0DT2H0M0S",
  currency: "EUR",
  cutoff_time: "P0Y0M1DT0H0M0S",
  state: "DRAFT",
  supplier: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  type: ExperienceType.CALENDAR_NO_TIMESLOTS,
  uuid: "95d80898-22dc-44d1-aa4e-cbebaa70c616",
};

export const mockDateAvailabilities: DateTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1 fri-sat,lang:no,cap:unlimited",
    date_range: { from: "2023-01-06", to: "2023-01-07" },
    days: {
      "5": {
        languages: [],
        pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
      },

      "6": {
        languages: [],
        pricings: [
          { pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" },
          { pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" },
        ],
      },
    },
  },
  {
    id: "2bd68a28-7b19-48ce-bc33-6b92ab8cd222",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 3 wed-thu,lang:no,cap:unlimited",
    date_range: { from: "2023-01-04", to: "2023-01-05" },
    days: {
      "3": {
        languages: [],
        pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
      },

      "4": {
        languages: [],
        pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
      },
    },
  },
  {
    id: "3bd68a28-7b19-48ce-bc33-6b92ab8cd333",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 2 mon-tue,lang:no,cap:unlimited",
    date_range: { from: "2023-01-16", to: "2023-01-17" },
    days: {
      "1": {
        languages: [],
        pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
      },

      "2": {
        languages: [],
        pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
      },
    },
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
    free_of_charge: true,
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
