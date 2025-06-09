import { Page } from "@playwright/test";
import { mockData, mockMasterData } from "../../utils/mockMasterData";
import { mockRequests } from "../../utils/mockRequest";
import {
  mockRawOptionsData,
  mockRawPricingData,
  mockOfferServiceExperience,
  rawContentProductTypeNova,
  rawContentProductTypeAsterix,
  mockOfferServiceDateTimeTicket,
  mockSlots,
  mockRefundPolicies,
  mockPickups,
  mockPickupPlaces,
  mockSuppliers,
  mockDistributionContentWithSupplierId,
  distributionContentProductTypeAsterix,
  mockCurrencies,
  mockRawSnapshot,
  mockAsterixServices,
  mockAsterixModalities,
  distributionContentProductTypeSip,
  mockApiEvents,
  mockExperiencePaxes,
} from "./experience-raw.data";
import { mockLocationData } from "./location/location.data";
import { mockBookingInfo } from "./customer-info/customer-info.data";
import { mockExperienceBookingQuestions } from "../options/customer-details/customer-details.data";
import { PricingDefinition } from "@/types/Options";
import { DistributionContent, RawElement } from "@/types/generated/ExperienceRawServiceApi";

export const experienceRawURL = "http://localhost:8084";
export const offerServiceURL = "http://localhost:8088";
export const metadataURL = "http://localhost:8086";
export const inventoryServiceUrl = "http://localhost:8089";
export const pickupPlaceServiceUrl = "http://localhost:8091";
export const pickupServiceUrl = "http://localhost:8092";
export const contractMasterDataServiceUrl = "http://localhost:8095";
export const geoMasterDataUrl = "http://localhost:8094";

export default async function (
  page: Page,
  product_type: DistributionContent["experience_source"],
  pricingDefinition?: PricingDefinition
) {
  let distributionContent: DistributionContent;
  let rawContent: RawElement;

  switch (product_type) {
    case "NOVA":
      distributionContent = mockDistributionContentWithSupplierId;
      rawContent = rawContentProductTypeNova;
      break;
    case "ASX":
      distributionContent = distributionContentProductTypeAsterix;
      rawContent = rawContentProductTypeAsterix;
      break;
    case "SIP":
      distributionContent = distributionContentProductTypeSip;
      rawContent = rawContentProductTypeNova;
      break;
    default:
      throw new Error(`can't mock api for ${product_type} product type`);
  }

  await mockMasterData(page);

  // mock distribution content for supplierId
  await mockRequests(page, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: distributionContent },
    PUT: { responseBody: "" },
    PATCH: { responseBody: "" },
  });

  // Mock Experience Raw
  await mockRequests(page, `${experienceRawURL}/experience-raw/*`, {
    GET: { responseBody: rawContent },
    PATCH: {},
    PUT: {},
  });

  // Mock send-to-review endpoint
  await mockRequests(page, `${experienceRawURL}/experience-raw/*/send-to-review`, {
    POST: { responseBody: "" },
  });

  await mockRequests(page, `${experienceRawURL}/v2/experience-raw*`, {
    GET: { responseBody: [rawContent] },
  });
  await mockRequests(page, `${experienceRawURL}/v2/experience-raw/*`, {
    PUT: {},
  });

  // Mock experience booking question
  await mockRequests(page, `${metadataURL}/experience-booking-questions*`, {
    GET: {
      responseBody: [mockExperienceBookingQuestions],
    },
    POST: {},
  });

  await page.route(`${metadataURL}/experience-booking-questions/*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockExperienceBookingQuestions),
        });
        break;
      case "PUT":
        await route.fulfill({
          status: 204,
        });
        break;

      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await mockRequests(page, `${experienceRawURL}/raw-snapshot*`, {
    GET: { responseBody: [mockRawSnapshot] },
  });

  await mockRequests(page, `${metadataURL}/experience-venues*`, {
    GET: { responseBody: mockData.venues[0].code },
  });

  // Mock booking information
  await mockRequests(page, `${metadataURL}/experience-booking-information*`, {
    GET: { responseBody: mockBookingInfo },
  });
  await mockRequests(page, `${metadataURL}/experience-booking-information/*`, {
    PUT: {},
  });

  // Mock Location
  await mockRequests(page, `${metadataURL}/experience-location*`, {
    GET: { responseBody: [mockLocationData] },
  });
  await mockRequests(page, `${metadataURL}/experience-location/*`, {
    PUT: {
      headers: { location: "/123/test-id" },
    },
  });

  // mock experience pax types
  await mockRequests(page, `${offerServiceURL}/experiences/*/experience-paxes`, {
    GET: { responseBody: mockExperiencePaxes },
    PUT: { responseBody: mockExperiencePaxes },
  });

  // mock offer experience
  await mockRequests(page, `${offerServiceURL}/experiences/*`, {
    GET: { responseBody: mockOfferServiceExperience },
    PUT: {},
  });

  // mock pricings
  await mockRequests(page, `${offerServiceURL}/pricings*`, {
    GET: { responseBody: mockRawPricingData },
  });

  // mock datetime tickets
  await mockRequests(page, `${offerServiceURL}/datetime-tickets*`, {
    GET: { responseBody: mockOfferServiceDateTimeTicket },
  });

  // mock slots
  await mockRequests(page, `${inventoryServiceUrl}/slots*`, {
    GET: {
      responseBody: [
        ...mockSlots,
        { ...mockSlots[0], option: { ...mockSlots[0].option, pricing_type_allowed: pricingDefinition } },
      ],
    },
    PUT: {},
  });
  await mockRequests(page, `${inventoryServiceUrl}/slots/**`, {
    POST: { responseBody: mockSlots },
  });

  await mockRequests(page, `${pickupServiceUrl}/pickups*`, {
    GET: { responseBody: mockPickups },
  });

  await mockRequests(page, `${pickupPlaceServiceUrl}/pickup-places*`, {
    GET: { responseBody: mockPickupPlaces },
  });

  // mock contract master data
  await mockRequests(page, `${contractMasterDataServiceUrl}/suppliers*`, {
    GET: { responseBody: mockSuppliers },
  });

  await mockRequests(page, `${contractMasterDataServiceUrl}/currencies*`, {
    GET: { responseBody: mockCurrencies },
  });

  // mock options
  await page.route(`${offerServiceURL}/options*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockRawOptionsData),
        });
        break;

      case "POST":
        addMockOption();
        await route.fulfill({
          status: 201,
          body: JSON.stringify(mockRawOptionsData[0]),
        });
        break;

      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/options/test-option-id*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockRawOptionsData[0]),
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
  function removeMockOption() {
    mockRawOptionsData.splice(mockRawOptionsData.length - 1, 1);
  }

  function addMockOption() {
    const newLength = mockRawOptionsData.length + 1;

    mockRawOptionsData.push({
      id: `test-option-id-${newLength}`,
      name: `TEST OPTION NOVA ${newLength}`,
      multilanguage: true,
      capacity_type: "unlimited",
      duration: "P0Y1DT2H3M0S",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      pricing_type_allowed: "person",
    });
  }

  await mockRequests(page, /refund-policies.*/, {
    GET: { responseBody: mockRefundPolicies },
    PUT: {},
    POST: {},
    DELETE: {},
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences*`, {
    GET: { responseBody: mockAsterixServices },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences/SVC-1/modalities*`, {
    GET: { responseBody: mockAsterixModalities.get("SVC-1") },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences/SVC-2/modalities*`, {
    GET: { responseBody: mockAsterixModalities.get("SVC-2") },
  });

  await mockRequests(page, `${experienceRawURL}/asx/experiences/SVC-3/modalities*`, {
    GET: { responseBody: mockAsterixModalities.get("SVC-3") },
  });

  await mockRequests(page, `${experienceRawURL}/external-experiences*`, {
    GET: { responseBody: [mockApiEvents[0]] },
  });
}
