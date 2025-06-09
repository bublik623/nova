import { Page } from "@playwright/test";
import {
  experienceRawURL,
  pickupPlaceServiceUrl,
  pickupServiceUrl,
} from "../../../experience/raw/experience-raw.mocks";
import {
  mockDistributionContentWithSupplierId,
  mockPickupPlaces,
  mockPickups,
  rawContentProductTypeNova,
} from "../../../experience/raw/experience-raw.data";
import { mockMasterData } from "../../../utils/mockMasterData";
import { mockOfferService } from "../../../utils/mockOfferService";
import { mockRequest, mockRequests } from "../../../utils/mockRequest";
import { pricingUrlGet } from "../pricing/pricing.mocks";
import { mockOptionData, mockPricingsData } from "./availability.data";
import { mockLocationData } from "../../raw/location/location.data";
import { mockBookingInfo } from "../../raw/customer-info/customer-info.data";
import { mockExperienceBookingQuestions } from "../customer-details/customer-details.data";

export const offerServiceURL = "http://localhost:8088";
export const metadataURL = "http://localhost:8086";

export default async function (page: Page) {
  // Mock Master Data
  await mockMasterData(page);
  await mockOfferService(page);

  // mock distribution content for supplierId
  await mockRequests(page, `${experienceRawURL}/distribution-content/*`, {
    GET: { responseBody: mockDistributionContentWithSupplierId },
    PUT: { responseBody: "" },
  });

  // Mock Experience Raw
  await mockRequests(page, `${experienceRawURL}/v2/experience-raw*`, {
    GET: { responseBody: [rawContentProductTypeNova] },
  });
  await mockRequests(page, `${experienceRawURL}/v2/experience-raw/*`, {
    PUT: {},
  });

  await mockRequest(page, `${metadataURL}/experience-location*`, "GET", {
    responseBody: mockLocationData,
  });

  await mockRequest(page, `${metadataURL}/experience-booking-information*`, "GET", {
    responseBody: mockBookingInfo,
  });

  await mockRequest(page, `${metadataURL}/experience-booking-questions*`, "GET", {
    responseBody: [mockExperienceBookingQuestions],
  });

  await mockRequest(page, `${metadataURL}/experience-markets*`, "GET", {
    responseBody: [],
  });

  await mockRequest(page, `${offerServiceURL}/refund-policies*`, "GET", {
    responseBody: [],
  });

  await mockRequest(page, `${pickupServiceUrl}/pickups*`, "GET", {
    responseBody: mockPickups,
  });

  await mockRequest(page, `${pickupPlaceServiceUrl}/pickup-places*`, "GET", { responseBody: mockPickupPlaces });

  // mock pricing
  await page.route(pricingUrlGet, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockPricingsData),
      });
    } else throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
  });

  // mock option
  await page.route(`${offerServiceURL}/options/test-option-id`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 204,
        body: JSON.stringify(mockOptionData),
      });
    } else {
      throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });
}
