import { experienceMasterDataURL, offerServiceURL } from "@/test/integration/utils/mock-api-urls";
import { mockRequests } from "@/test/integration/utils/mockRequest";
import {
  ExperienceLanguages,
  InternalPricing,
  OptionPaxes,
  Option,
  ExperiencePaxes,
} from "@/types/generated/OfferServiceApi";
import { Page } from "@playwright/test";
import {
  mockInternalPricingsResponse,
  mockOpinoiaExperienceId,
  mockOptionPaxesResponse1,
  mockOptionPaxesResponse2,
  mockOptionPaxesResponse3,
  mockExperienceLanguagesResponse,
  mockOptionsResponse,
  mockPaxResponse,
  mockExperiencePaxesResponse,
} from "./price.data";

type PriceRouteMockConfig = {
  experienceId?: string;
  options?: Option[];
  experienceLanguages?: ExperienceLanguages;
  internalPricings?: InternalPricing[];
  optionPaxes?: OptionPaxes[];
  experiencePaxes?: ExperiencePaxes;
};

export async function mockPriceSectionEndpoints(
  page: Page,
  {
    experienceId = mockOpinoiaExperienceId,
    options = mockOptionsResponse,
    experienceLanguages = mockExperienceLanguagesResponse,
    internalPricings = mockInternalPricingsResponse,
    optionPaxes = [mockOptionPaxesResponse1, mockOptionPaxesResponse2, mockOptionPaxesResponse3],
    experiencePaxes = mockExperiencePaxesResponse,
  }: PriceRouteMockConfig = {}
) {
  // pricings
  await mockRequests(page, `${offerServiceURL}/internal-product/pricings*`, {
    GET: { responseBody: internalPricings },
    POST: {},
  });
  // experience languages
  await mockRequests(page, `${offerServiceURL}/experiences/${experienceId}/experience-languages`, {
    GET: { responseBody: experienceLanguages },
  });
  // options
  await mockRequests(page, `${offerServiceURL}/options*`, {
    GET: { responseBody: options },
  });
  // option paxes
  for (const optionPaxesItem of optionPaxes) {
    await mockRequests(page, `${offerServiceURL}/options/${optionPaxesItem.option_id}/option-paxes`, {
      GET: { responseBody: optionPaxesItem },
    });
  }
  // experience paxes
  await mockRequests(page, `${offerServiceURL}/experiences/${experienceId}/experience-paxes`, {
    GET: { responseBody: experiencePaxes },
  });
}

export async function mockExperienceMasterData(page: Page) {
  await mockRequests(page, `${experienceMasterDataURL}/pax*`, {
    GET: { responseBody: mockPaxResponse },
  });
}
