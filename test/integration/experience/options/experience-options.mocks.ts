import { Page } from "@playwright/test";
import { experienceRawURL, pickupPlaceServiceUrl, pickupServiceUrl } from "../../experience/raw/experience-raw.mocks";
import {
  mockDistributionContentWithSupplierId,
  mockPickupPlaces,
  mockPickups,
  rawContentProductTypeNova,
} from "../../experience/raw/experience-raw.data";
import { mockMasterData } from "../../utils/mockMasterData";
import { mockRequest, mockRequests } from "../../utils/mockRequest";
import {
  mockDateAvailabilities,
  mockOfferExperience,
  mockOfferExperienceFixedValidity,
  mockOfferExperienceFixedEnd,
  mockOptionsData,
  mockPricingData,
  mockOpenAvailabilitiesFixedEnd,
  mockExperiencePaxTypes,
} from "./experience-options.data";
import { mockDatetimeAvailabilities } from "./availability/availability.data";
import { mockLocationData } from "../raw/location/location.data";
import { mockBookingInfo } from "../raw/customer-info/customer-info.data";
import { mockExperienceBookingQuestions } from "./customer-details/customer-details.data";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

export const offerServiceURL = "http://localhost:8088";
export const pricingUrlGet = `${offerServiceURL}/pricings*`;
export const pricingUrlDelete = `${offerServiceURL}/pricings/*`;
export const pricingUrlPut = `${offerServiceURL}/pricings/*`;
export const metadataURL = "http://localhost:8086";

const mockPricingResponse = [...mockPricingData];
export default async function (page: Page, expType?: ExperienceType) {
  await mockMasterData(page);

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

  await mockRequest(page, `${offerServiceURL}/experiences*`, "POST");

  await mockRequest(page, `${offerServiceURL}/experiences/*/publish`, "POST", {
    responseBody: {},
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

  await page.route(`${metadataURL}/experience-booking-questions/*`, async (route, req) => {
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

  // mock experience pax types
  await mockRequests(page, `${offerServiceURL}/experiences/*/experience-paxes`, {
    GET: { responseBody: { pax_list: mockExperiencePaxTypes } },
  });

  await page.route(`${offerServiceURL}/experiences/*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
      case "PUT":
        await route.fulfill({
          status: 200,
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/experiences/test-experience-id`, async (route, req) => {
    switch (req.method()) {
      case "GET":
      case "PUT":
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ ...mockOfferExperience, type: expType }),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });
  await page.route(`${offerServiceURL}/experiences/mock-experience-id`, async (route, req) => {
    switch (req.method()) {
      case "GET":
      case "PUT":
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ ...mockOfferExperience, type: expType }),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/experiences/test-experience-fixed-validity`, async (route, req) => {
    switch (req.method()) {
      case "GET":
      case "PUT":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockOfferExperienceFixedValidity),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/experiences/test-experience-fixed-end`, async (route, req) => {
    switch (req.method()) {
      case "GET":
      case "PUT":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockOfferExperienceFixedEnd),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/options*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockOptionsData),
        });
        break;

      case "POST":
        addMockOption();
        await route.fulfill({
          status: 201,
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
          body: JSON.stringify(mockOptionsData[0]),
        });
        break;

      case "PUT":
        await route.fulfill({
          status: 204,
          body: JSON.stringify(mockOptionsData[0]),
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

  await page.route(pricingUrlGet, async (route, req) => {
    const method = req.method();
    const url = req.url();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockPricingResponse),
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

  await page.route(`${offerServiceURL}/date-tickets/*`, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([...mockDateAvailabilities]),
    });
  });

  await page.route(`${offerServiceURL}/datetime-tickets*`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([...mockDatetimeAvailabilities]),
      });
    } else {
      throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/open-tickets*`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([...mockOpenAvailabilitiesFixedEnd]),
      });
    } else {
      throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  function removeMockOption() {
    mockOptionsData.splice(mockOptionsData.length - 1, 1);
  }

  function addMockOption() {
    const newLength = mockOptionsData.length + 1;

    mockOptionsData.push({
      id: `test-option-id-${newLength}`,
      name: `TEST OPTION NOVA ${newLength}`,
      multilanguage: true,
      capacity_type: "unlimited",
      duration: "P0Y1DT2H3M0S",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      pricing_type_allowed: "person",
    });
  }

  await mockRequests(page, `${offerServiceURL}/refund-policies*`, {
    GET: { responseBody: [] },
    PUT: {},
    POST: {},
    DELETE: {},
  });
}
