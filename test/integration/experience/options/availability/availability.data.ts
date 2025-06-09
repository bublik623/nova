import { Option } from "@/types/generated/OfferServiceApi";
import {
  DateTicket,
  DatetimeTicket,
  Experience,
  ExperienceType,
  OpenTicket,
} from "@/types/generated/OfferServiceApiOld";

export const mockOptionData: Option = {
  id: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
  name: "Option for availability",
  duration: "P0Y0M4DT0H0M0S",
  multilanguage: true,
  capacity_type: "unlimited",
  status: "DRAFT",
  experience: "397f2319-ed50-448a-bb85-e302a365fe5e",
  allowed_languages: [{ language: "en" }, { language: "fr" }],
};

export const mockOfferExperience = (experienceType: ExperienceType): Experience => ({
  confirmation_time: "P0Y0M0DT2H0M0S",
  currency: "USD",
  cutoff_time: "P0Y0M1DT0H0M0S",
  state: "DRAFT",
  supplier: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  type: experienceType,
  uuid: "95d80898-22dc-44d1-aa4e-cbebaa70c616",
});

export const mockDatetimeAvailabilities: DatetimeTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1 fri-sat,lang:no,cap:unlimited",
    date_range: { from: "2023-01-06", to: "2023-01-07" },
    days: {
      "5": [
        {
          time: "09:00:00",
          languages: [],
          pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
        },
        {
          time: "10:00:00",
          languages: [],
          pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
        },
      ],
      "6": [
        {
          time: "09:00:00",
          languages: [],
          pricings: [
            { pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" },
            { pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" },
          ],
        },
      ],
    },
  },
  {
    id: "2bd68a28-7b19-48ce-bc33-6b92ab8cd222",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 3 wed-thu,lang:no,cap:unlimited",
    date_range: { from: "2023-01-04", to: "2023-01-05" },
    days: {
      "3": [
        {
          time: "09:00:00",
          languages: [],
          pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
        },
      ],
      "4": [
        {
          time: "09:00:00",
          languages: [],
          pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
        },
      ],
    },
  },
  {
    id: "3bd68a28-7b19-48ce-bc33-6b92ab8cd333",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 2 mon-tue,lang:no,cap:unlimited",
    date_range: { from: "2023-01-16", to: "2023-01-17" },
    days: {
      "1": [
        {
          time: "09:00:00",
          languages: [],
          pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
        },
      ],
      "2": [
        {
          time: "09:00:00",
          languages: [],
          pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
        },
      ],
    },
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

export const mockOpenAvailabilitiesFixedValidity: OpenTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1",
    expiration_date: null,
    expiration_days: 12,
    pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
    languages: [],
  },
  {
    id: "21107e33-2311-4928-b2f4-a9ffe871396a",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 2",
    expiration_date: null,
    expiration_days: 15,
    pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
    languages: [],
  },
  {
    id: "32305673-28ce-4715-a33b-143a52c573cc",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 3",
    expiration_date: null,
    expiration_days: 21,
    pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
    languages: [],
  },
];

export const mockOpenAvailabilitiesFixedEnd: OpenTicket[] = [
  {
    id: "1bd68a28-7b19-48ce-bc33-6b92ab8cd111",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 1",
    expiration_date: "2050-01-10",
    expiration_days: null,
    pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
    languages: [],
  },
  {
    id: "21107e33-2311-4928-b2f4-a9ffe871396a",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 2",
    expiration_date: "2050-03-05",
    expiration_days: null,
    pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
    languages: [],
  },
  {
    id: "32305673-28ce-4715-a33b-143a52c573cc",
    option: "0890e65f-cb53-42a1-bb8c-926839ee0c3e",
    name: "Mock Availability 3",
    expiration_date: "2050-08-10",
    expiration_days: null,
    pricings: [{ pricing: "89e764e8-08a2-4126-9ca4-280b0a3b8b18" }],
    languages: [],
  },
];

export const mockPricingsData = [
  {
    id: "89e764e8-08a2-4126-9ca4-280b0a3b8b18",
    name: "Mock pricing 1",
    holder: "adult",
    age_range: {
      from: 1,
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
