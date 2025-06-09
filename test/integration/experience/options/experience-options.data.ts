import { DateTicket, Experience, ExperienceType, OpenTicket } from "@/types/generated/OfferServiceApiOld";
import { Option, Pax } from "@/types/generated/OfferServiceApi";

export const mockOptionsData: Option[] = [
  {
    id: "test-option-id-1",
    name: "TEST OPTION NOVA 1",
    multilanguage: true,
    capacity_type: "unlimited",
    duration: "P0Y1DT2H3M0S",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    pricing_type_allowed: "person",
    allowed_languages: [{ language: "en" }, { language: "fr" }],
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
    capacity_type: "unlimited",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    pricing_type_allowed: "person",
  },
];

export const mockOfferExperience: Experience = {
  confirmation_time: "P0Y0M0DT2H0M0S",
  currency: "USD",
  cutoff_time: "P0Y0M1DT0H0M0S",
  state: "DRAFT",
  supplier: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  type: ExperienceType.CALENDAR_NO_TIMESLOTS,
  uuid: "95d80898-22dc-44d1-aa4e-cbebaa70c616",
};

export const mockOfferExperienceFixedValidity: Experience = {
  confirmation_time: "P0Y0M0DT2H0M0S",
  currency: "USD",
  cutoff_time: "P0Y0M1DT0H0M0S",
  state: "DRAFT",
  supplier: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  type: ExperienceType.NO_CALENDAR_FIXED_VALIDITY,
  uuid: "95d80898-22dc-44d1-aa4e-cbebaa70c616",
};

export const mockOfferExperienceFixedEnd: Experience = {
  confirmation_time: "P0Y0M0DT2H0M0S",
  currency: "USD",
  cutoff_time: "P0Y0M1DT0H0M0S",
  state: "DRAFT",
  supplier: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  type: ExperienceType.NO_CALENDAR_FIXED_END,
  uuid: "95d80898-22dc-44d1-aa4e-cbebaa70c616",
};

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

export const mockDateAvailabilities: DateTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1 fri-sat,lang:no,cap:unlimited",
    date_range: { from: "2023-01-06", to: "2023-01-07" },
    days: {
      "5": {
        languages: [{ language: "en" }],
        pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
      },

      "6": {
        languages: [{ language: "en" }],
        pricings: [
          { pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" },
          { pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" },
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
        languages: [{ language: "en" }],
        pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
      },

      "4": {
        languages: [{ language: "en" }],
        pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
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
        languages: [{ language: "en" }],
        pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
      },

      "2": {
        languages: [{ language: "en" }],
        pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
      },
    },
  },
];

export const mockOpenAvailabilitiesFixedValidity: OpenTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1",
    expiration_date: null,
    expiration_days: 12,
    pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
  },
  {
    id: "21107e33-2311-4928-b2f4-a9ffe871396a",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 2",
    expiration_date: null,
    expiration_days: 15,
    pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
  },
  {
    id: "32305673-28ce-4715-a33b-143a52c573cc",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 3",
    expiration_date: null,
    expiration_days: 21,
    pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
  },
];

export const mockOpenAvailabilitiesFixedEnd: OpenTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1",
    expiration_date: "02/03/2023",
    expiration_days: null,
    pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
  },
  {
    id: "21107e33-2311-4928-b2f4-a9ffe871396a",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 2",
    expiration_date: "05/11/2023",
    expiration_days: null,
    pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
  },
  {
    id: "32305673-28ce-4715-a33b-143a52c573cc",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 3",
    expiration_date: "07/10/2023",
    expiration_days: null,
    pricings: [{ pricing: "4a60d96b-adee-42ae-917b-f84d098546f2" }],
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
