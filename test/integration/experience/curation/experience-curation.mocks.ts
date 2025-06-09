import { Page } from "@playwright/test";
import { mockMasterData } from "../../utils/mockMasterData";
import { mockOfferService } from "../../utils/mockOfferService";
import { mockRequests } from "../../utils/mockRequest";
import { mockLocationData, mockVenues } from "../raw/location/location.data";
import {
  rawContent,
  editorialContent,
  experienceMetadata,
  customOptions,
  offerServiceExperience,
  mockCurationOptionsData,
  mockOfferServiceDateTimeTicket,
  mockCurationPricingData,
  mockRefundPolicies,
  mockPickups,
  mockPickupPlaces,
  mockExperiencePaxTypes,
} from "./experience-curation.data";
import { mockBookingInfo } from "../raw/customer-info/customer-info.data";
import { mockExperienceBookingQuestions } from "../options/customer-details/customer-details.data";
import { contractMasterDataServiceUrl, inventoryServiceUrl } from "../raw/experience-raw.mocks";
import {
  mockCurrencies,
  mockDistributionContentWithSupplierId,
  distributionContentProductTypeAsterix,
  mockRawSnapshot,
  mockSlots,
  mockSuppliers,
  mockTranslationSnapshotData,
} from "../raw/experience-raw.data";
import { DistributionContent } from "@/types/generated/ExperienceRawServiceApi";
import { translationSnapshotMock } from "../revision/translation/translation-revision.data";

const contentCommandURL = "http://localhost:8081";
const experienceRawURL = "http://localhost:8084";
const metadataURL = "http://localhost:8086";
const offerServiceURL = "http://localhost:8088";
export const pickupPlaceServiceUrl = "http://localhost:8091";
export const pickupServiceUrl = "http://localhost:8092";

export default async function (p: Page, product_type: DistributionContent["experience_source"]) {
  let distributionContent: DistributionContent;

  switch (product_type) {
    case "NOVA":
      distributionContent = mockDistributionContentWithSupplierId;
      break;
    case "ASX":
      distributionContent = distributionContentProductTypeAsterix;
      break;
    default:
      throw new Error(`can't mock api for ${product_type} product type`);
  }

  // Mock Master Data
  await mockMasterData(p);
  await mockOfferService(p);

  // mock distribution content for supplierId
  await mockRequests(p, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: distributionContent },
    PUT: { responseBody: "" },
  });

  // Mock Experience Raw
  await mockRequests(p, `${experienceRawURL}/experience-raw/*`, {
    GET: { responseBody: rawContent },
  });

  // Mock Content Command

  await mockRequests(p, `${contentCommandURL}/experience-translations*`, {
    GET: { responseBody: [editorialContent] },
  });
  await mockRequests(p, `${contentCommandURL}/experience-translations/*`, {
    PUT: {},
  });
  await mockRequests(p, `${contentCommandURL}/custom-*`, {
    GET: { responseBody: customOptions },
  });
  await mockRequests(p, `${contentCommandURL}/experiences/*/translate`, {
    POST: {},
  });

  // Mock Meta Data
  await mockRequests(p, `${metadataURL}/experience-highlights*`, {
    GET: {
      responseBody: [experienceMetadata.highlights],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-included*`, {
    GET: {
      responseBody: [experienceMetadata.included],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-non-included*`, {
    GET: {
      responseBody: [experienceMetadata.nonIncluded],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-important*`, {
    GET: {
      responseBody: [experienceMetadata.importantInfo],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-additional*`, {
    GET: {
      responseBody: [experienceMetadata.additionalServices],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-categories*`, {
    GET: {
      responseBody: [experienceMetadata.categories],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-interests*`, {
    GET: {
      responseBody: [experienceMetadata.interests],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-location*`, {
    GET: {
      responseBody: [mockLocationData],
    },
  });
  await mockRequests(p, `${metadataURL}/experience-location/*`, {
    PUT: {},
  });

  await mockRequests(p, `${metadataURL}/experience-booking-information*`, {
    GET: {
      responseBody: mockBookingInfo,
    },
  });

  await mockRequests(p, `${metadataURL}/experience-booking-information/*`, {
    PUT: {},
  });

  await mockRequests(p, `${metadataURL}/experience-booking-questions*`, {
    GET: {
      responseBody: [mockExperienceBookingQuestions],
    },
    POST: {},
  });

  await mockRequests(p, /experience-markets.*/, {
    GET: { responseBody: [experienceMetadata.markets] },
    PUT: {},
    POST: {
      headers: { location: "/123/new-market" },
    },
  });

  await mockRequests(p, /experience-.*\/id.*/, { PUT: {} });

  // Mock Experience Raw
  await mockRequests(p, `${experienceRawURL}/v2/experience-raw*`, {
    GET: { responseBody: [rawContent] },
  });
  await mockRequests(p, `${experienceRawURL}/v2/experience-raw/*`, {
    PUT: {},
  });

  await mockRequests(p, `${experienceRawURL}/raw-snapshot*`, {
    GET: { responseBody: [mockRawSnapshot] },
  });

  await mockRequests(p, `${experienceRawURL}/snapshot*`, {
    GET: { responseBody: [mockTranslationSnapshotData] },
  });

  await mockRequests(p, `${experienceRawURL}/translation-snapshot*`, {
    GET: { responseBody: [translationSnapshotMock] },
  });

  // Mock Offer Service
  await mockRequests(p, `${offerServiceURL}/datetime-ticket*`, {
    GET: {
      responseBody: mockOfferServiceDateTimeTicket,
    },
  });
  await mockRequests(p, `${offerServiceURL}/pricings*`, {
    GET: {
      responseBody: mockCurationPricingData,
    },
  });
  await mockRequests(p, `${offerServiceURL}/experiences/*/experience-paxes`, {
    GET: { responseBody: { pax_list: mockExperiencePaxTypes } },
  });
  await mockRequests(p, `${offerServiceURL}/experiences/*`, {
    GET: {
      responseBody: offerServiceExperience,
    },
    PUT: {},
  });

  // mock slots
  await mockRequests(p, `${inventoryServiceUrl}/slots*`, {
    GET: { responseBody: mockSlots },
    PUT: {},
  });
  await mockRequests(p, `${inventoryServiceUrl}/slots/**`, {
    POST: { responseBody: mockSlots },
  });

  // mock options
  await p.route(`${offerServiceURL}/options*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockCurationOptionsData),
        });
        break;

      case "POST":
        addMockOption();
        await route.fulfill({
          status: 201,
          body: JSON.stringify(mockCurationOptionsData[0]),
        });
        break;

      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await mockRequests(p, `${pickupServiceUrl}/pickups*`, {
    GET: { responseBody: mockPickups },
  });

  await mockRequests(p, `${pickupPlaceServiceUrl}/pickup-places*`, {
    GET: { responseBody: mockPickupPlaces },
  });

  await mockRequests(p, `${contractMasterDataServiceUrl}/suppliers*`, {
    GET: { responseBody: mockSuppliers },
  });

  await mockRequests(p, `${contractMasterDataServiceUrl}/currencies*`, {
    GET: { responseBody: mockCurrencies },
  });

  await p.route(`${offerServiceURL}/options/test-option-id*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockCurationOptionsData[0]),
        });
        break;

      case "DELETE":
        removeMockOption();
        await route.fulfill({
          status: 204,
        });
        break;

      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await mockRequests(p, /refund-policies.*/, {
    GET: { responseBody: mockRefundPolicies },
    PUT: {},
    POST: {},
    DELETE: {},
  });

  // Mock experience-venues endpoints
  await mockRequests(p, `${metadataURL}/experience-venues*`, {
    GET: { responseBody: [mockVenues] },
    POST: { headers: { location: "/experience-venues/new-venue-id" } },
  });

  await mockRequests(p, `${metadataURL}/experience-venues/*`, {
    PUT: { responseBody: {} },
    DELETE: { responseBody: null },
  });
}
function removeMockOption() {
  mockCurationOptionsData.splice(mockCurationOptionsData.length - 1, 1);
}
function addMockOption() {
  const newLength = mockCurationOptionsData.length + 1;

  mockCurationOptionsData.push({
    id: `test-option-id-${newLength}`,
    name: `TEST OPTION NOVA ${newLength}`,
    multilanguage: true,
    capacity_type: "unlimited",
    duration: "P0Y1DT2H3M0S",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    pricing_type_allowed: "person",
  });
}
