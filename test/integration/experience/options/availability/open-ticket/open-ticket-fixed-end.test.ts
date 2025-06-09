import { test, expect } from "@playwright/test";
import { ExperienceAvailabilityPage, selectors } from "../availability.fixture";
import { mockOpenAvailabilitiesFixedEnd, mockOfferExperience } from "../availability.data";
import mockApi, { offerServiceURL } from "../availability.mocks";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { testId } from "@/utils/test.utils";

let mockAvailabilitiesResponse = [...mockOpenAvailabilitiesFixedEnd];
let pageObject: ExperienceAvailabilityPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page);

  // Mock offer service experience
  await page.route(`${offerServiceURL}/experiences/test-experience-open-fixed-end*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            ...mockOfferExperience(ExperienceType.NO_CALENDAR_FIXED_END),
          }),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/open-tickets*`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockAvailabilitiesResponse),
      });
    } else {
      throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  // mock DELETE availability
  await page.route(`${offerServiceURL}/open-tickets/*`, async (route, req) => {
    if (req.method() === "DELETE") {
      const itemId = req.url().split("/").pop();
      // delete the pricing from our mock response
      mockAvailabilitiesResponse = mockAvailabilitiesResponse.filter((item) => item.id !== itemId);
      await route.fulfill({ status: 201, body: JSON.stringify({}) });
    }
  });

  await page.goto("/experience/test-experience-open-fixed-end/options/raw/test-option-id/availability");
  await page.waitForSelector(testId("AvailabilityIndexPage"));

  pageObject = new ExperienceAvailabilityPage(page);
});
test("Availability Page - Open Ticket - Fixed End", async ({ page }) => {
  await test.step("view all availabilities", async () => {
    // 3 items on mount
    expect(await pageObject.availabilityCards.count()).toBe(3);

    // check fields
    expect(await pageObject.findAvailabilityCard(0).findTitle().textContent()).toContain("Mock Availability 1");
    expect(await pageObject.findAvailabilityCard(0).findNameInput().inputValue()).toContain("Mock Availability 1");
    expect(await pageObject.findAvailabilityCard(0).findValidityDateInput().textContent()).toContain("10/01/2050");

    // check the time slot
    expect(await pageObject.findAvailabilityCard(0).findDayCards().count()).toBe(1);

    // check validity
    await pageObject.checkPageValidity(true);
  });

  await test.step("clear the time slot", async () => {
    const timeslot = pageObject.findAvailabilityCard(0).findDayCard(0).findTimeSlot(1);

    expect(await timeslot.findPricingInput().innerText()).toContain("Mock pricing 1");
    await timeslot.findClear().click();

    expect(await timeslot.findPricingInput().innerText()).toContain("");

    // check validity
    await pageObject.checkPageValidity(false);
  });

  await test.step("create a new availability", async () => {
    // 3 items
    expect(await pageObject.availabilityCards.count()).toBe(3);

    // click the add add availability button
    await pageObject.findAddAvailabilityButton().click();

    // new item should be exist in the list
    expect(await pageObject.availabilityCards.count()).toBe(4);

    // last item should have empty name field
    expect(await pageObject.findAvailabilityCard(3).findNameInput().inputValue()).toBe("");
  });

  await test.step("delete all availabilities", async () => {
    let count = 0;

    while (count < 4) {
      // click the delete icon of the first item
      await pageObject.findAvailabilityCard(0).findDeleteButton().click();
      await pageObject.findByTestId(selectors.modalConfirm).click();

      // wait for modal to close
      await pageObject.findByTestId(selectors.modalConfirm).isHidden();
      await page.waitForSelector(testId("AvailabilityIndexPage"));

      // Increase the count
      count++;

      // the item should be deleted
      const expectedNumber = 4 - count || 1; // When deleting the last availability, it should create an empty one automatically
      expect(await pageObject.availabilityCards.count()).toBe(expectedNumber);
    }

    // the form should not be valid
    await pageObject.checkPageValidity(false);
  });
});
