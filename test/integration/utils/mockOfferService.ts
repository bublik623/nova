import { Page } from "@playwright/test";
import { mockRequests } from "./mockRequest";
import { Pax } from "@/types/generated/OfferServiceApi";

export const offerServiceURL = "http://localhost:8088";

export async function mockOfferService(page: Page) {
  const mockOfferServiceExperience = {
    type: "CALENDAR-TIMESLOTS",
    confirmation_time: "P0D",
    cutoff_time: "P0D",
    supplier: "test-supplier-id",
    state: "DRAFT",
    currency: "EUR",
  };

  const mockOptionsData = [
    {
      id: "test-option-id-1",
      name: "TEST OPTION NOVA 1",
      multilanguage: true,
      capacity_type: "unlimited",
      duration: "P0Y1DT2H3M0S",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    },
    {
      id: "test-option-id-2",
      name: "TEST OPTION NOVA 2",
      multilanguage: true,
      capacity_type: "unlimited",
      duration: "P0Y1DT2H3M0S",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    },
    {
      id: "test-option-id-3",
      name: "TEST OPTION NOVA 3",
      multilanguage: true,
      capacity_type: "limited",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    },
  ];

  const mockExperiencePaxTypes: Pax[] = [
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

  // mock experience pax types
  await mockRequests(page, `${offerServiceURL}/experiences/*/experience-paxes`, {
    GET: { responseBody: mockExperiencePaxTypes },
  });

  await page.route(`${offerServiceURL}/experiences*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockOfferServiceExperience),
        });
        break;

      case "POST":
        await route.fulfill({
          status: 201,
        });
        break;

      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/experiences/*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify(mockOfferServiceExperience),
        });
        break;

      case "POST":
        await route.fulfill({
          status: 201,
        });
        break;

      case "DELETE":
        await route.fulfill({
          status: 204,
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
          body: JSON.stringify(mockOptionsData),
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
    });
  }
}
