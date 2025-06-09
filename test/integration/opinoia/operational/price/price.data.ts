import { Pax } from "@/types/generated/ExperienceMasterDataApi";
import {
  ExperienceLanguages,
  InternalPricing,
  OptionPaxes,
  Option,
  ExperiencePaxes,
} from "@/types/generated/OfferServiceApi";

export const mockOpinoiaExperienceId = "mock-opinoia-experience-id";

const mockPrice1: InternalPricing = {
  id: "mock-price-uuid-1",
  languages: ["en"],
  days: ["MONDAY", "TUESDAY"],
  currency: "EUR",
  date_from: "2025-05-05",
  date_to: "2025-05-12",
  option_id: "mock-option-1",
  prices: [
    {
      pax: "adult",
      cost: 20,
      suggested: 30,
      initial: 10,
    },
    {
      pax: "child",
      cost: 15,
      suggested: 25,
      initial: 10,
    },
  ],
};

const mockPrice2: InternalPricing = {
  id: "mock-price-uuid-2",
  languages: ["fr"],
  days: ["WEDNESDAY"],
  currency: "EUR",
  date_from: "2025-05-10",
  date_to: "2025-05-17",
  option_id: "mock-option-2",
  prices: [
    {
      pax: "adult",
      cost: 25,
      suggested: 22,
      initial: 20,
    },
  ],
};
export const mockInternalPricingsResponse: InternalPricing[] = [mockPrice1, mockPrice2];

export const mockOptionsResponse: Option[] = [
  {
    id: "mock-option-1",
    name: "mock option 1",
    code: "mock-option-1-code",
    multilanguage: true,
    capacity_type: "unlimited",
    experience: mockOpinoiaExperienceId,
  },
  {
    id: "mock-option-2",
    name: "mock option 2",
    code: "mock-option-2-code",
    multilanguage: true,
    capacity_type: "unlimited",
    experience: mockOpinoiaExperienceId,
  },
  {
    id: "mock-option-3",
    name: "mock option 3",
    code: "mock-option-3-code",
    multilanguage: true,
    capacity_type: "unlimited",
    experience: mockOpinoiaExperienceId,
  },
];

export const mockExperienceLanguagesResponse: ExperienceLanguages = {
  languages: ["en", "fr"],
};

export const mockOptionPaxesResponse1: OptionPaxes = {
  pax_list: [{ pax_code: "adult" }, { pax_code: "child" }],
  option_id: "mock-option-1",
};

export const mockOptionPaxesResponse2: OptionPaxes = {
  pax_list: [{ pax_code: "adult" }],
  option_id: "mock-option-2",
};

export const mockOptionPaxesResponse3: OptionPaxes = {
  pax_list: [],
  option_id: "mock-option-3",
};

export const mockPaxResponse: Pax[] = [
  {
    type: "PERSON",
    language_code: "en",
    name: "adult",
    description: "Adult",
    id: "adult",
    age_from: 18,
    age_to: 65,
  },
  {
    type: "PERSON",
    language_code: "en",
    name: "child",
    description: "Child",
    id: "child",
    age_from: 0,
    age_to: 17,
  },
];

export const mockExperiencePaxesResponse: ExperiencePaxes = {
  experience_id: "08344564-5a6e-41ee-965e-859be5698efd",
  pax_list: [
    {
      pax_type: "PERSON",
      pax_code: "adult",
      all_ages: false,
      age_from: 18,
      age_to: 64,
      free_of_charge: false,
    },
    {
      pax_type: "PERSON",
      pax_code: "child",
      all_ages: false,
      age_from: 3,
      age_to: 12,
      free_of_charge: false,
    },
  ],
};
