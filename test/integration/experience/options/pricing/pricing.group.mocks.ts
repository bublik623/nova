import { Page } from "@playwright/test";
import { experienceRawURL } from "../../../experience/raw/experience-raw.mocks";
import {
  mockDistributionContentWithSupplierId,
  mockPickupPlaces,
  mockPickups,
  rawContentProductTypeNova,
} from "../../../experience/raw/experience-raw.data";
import { mockMasterData } from "../../../utils/mockMasterData";
import { mockOfferService } from "../../../utils/mockOfferService";
import { mockRequest, mockRequests } from "../../../utils/mockRequest";
import { mockDateAvailabilities } from "../experience-options.data";
import { mockOfferExperience, mockOptionData, mockPricingData } from "./pricing.data";
import { mockLocationData } from "../../raw/location/location.data";
import { mockBookingInfo } from "../../raw/customer-info/customer-info.data";
import { mockExperienceBookingQuestions } from "../customer-details/customer-details.data";

export const offerServiceURL = "http://localhost:8088";
export const pricingUrlGet = `${offerServiceURL}/pricings*`;
export const pricingUrlDelete = `${offerServiceURL}/pricings/*`;
export const pricingUrlPut = `${offerServiceURL}/pricings/*`;
export const metadataURL = "http://localhost:8086";
export const pickupPlaceServiceUrl = "http://localhost:8091";
export const pickupServiceUrl = "http://localhost:8092";

const mockPricingResponse = [...mockPricingData];
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
  await mockRequest(page, `${experienceRawURL}/experience-raw/test-experience-id`, "GET", {
    responseBody: rawContentProductTypeNova,
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

  await mockRequest(page, `${pickupServiceUrl}/pickups*`, "GET", {
    responseBody: mockPickups,
  });

  await mockRequest(page, `${pickupPlaceServiceUrl}/pickup-places*`, "GET", { responseBody: mockPickupPlaces });

  await page.route(`${offerServiceURL}/experiences/*`, async (route, req) => {
    const method = req.method();
    const url = req.url();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockOfferExperience),
      });
    } else {
      throw new Error(`No mocked route for ${method} - ${url}`);
    }
  });

  await page.route(`${offerServiceURL}/options/test-option-id`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 204,
        body: JSON.stringify(mockOptionData),
      });
    } else {
      throw new Error("No mocked route!");
    }
  });

  await page.route(pricingUrlGet, async (route, req) => {
    const method = req.method();
    const url = req.url();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockPricingResponse),
      });
    } else if (method === "POST") {
      await route.fulfill({
        status: 200,
      });
    } else {
      throw new Error(`No mocked route for ${method} - ${url}`);
    }
  });

  await page.route(pricingUrlPut, async (route, req) => {
    const method = req.method();
    const url = req.url();

    if (method === "PUT") {
      await route.fulfill({
        status: 200,
      });
    } else {
      throw new Error(`No mocked route for ${method} - ${url}`);
    }
  });

  await page.route(`${offerServiceURL}/date-tickets*`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([...mockDateAvailabilities]),
      });
    } else {
      throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await mockRequest(page, `${offerServiceURL}/refund-policies*`, "GET", {
    responseBody: [],
  });
}
