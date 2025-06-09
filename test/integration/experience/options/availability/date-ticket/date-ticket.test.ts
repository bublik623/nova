import { test, expect } from "@playwright/test";
import { ExperienceAvailabilityPage, selectors } from "../availability.fixture";
import mockApi, { offerServiceURL } from "../availability.mocks";
import { mockDateAvailabilities, mockOfferExperience } from "../availability.data";
import { testId } from "@/utils/test.utils";
import { SHORT_DAY_NAMES } from "@/constants/date.constants";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

let mockAvailabilitiesResponse = [...mockDateAvailabilities];
let pageObject: ExperienceAvailabilityPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page);

  // Mock offer service experience
  await page.route(`${offerServiceURL}/experiences/mock-experience-id*`, async (route, req) => {
    switch (req.method()) {
      case "GET":
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            ...mockOfferExperience(ExperienceType.CALENDAR_NO_TIMESLOTS),
          }),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/date-tickets*`, async (route, req) => {
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
  await page.route(`${offerServiceURL}/date-tickets/*`, async (route, req) => {
    if (req.method() === "DELETE") {
      const itemId = req.url().split("/").pop();
      // delete the pricing from our mock response
      mockAvailabilitiesResponse = mockAvailabilitiesResponse.filter((item) => item.id !== itemId);
      await route.fulfill({ status: 201, body: JSON.stringify({}) });
    }
  });

  await page.goto("/experience/mock-experience-id/options/raw/test-option-id/availability");
  await page.waitForSelector(testId("AvailabilityIndexPage"));

  pageObject = new ExperienceAvailabilityPage(page);
});

test("Availability Page - Date Ticket", async ({ page }) => {
  await test.step("hide a day in schedule", async () => {
    // the mocked availability card `3`(last item on the list) has 2 day cards (monday and tuesday)
    const availabilityCard3 = pageObject.findAvailabilityCard(2);
    await availabilityCard3.findTitle().click();

    expect(await availabilityCard3.findDayCards().count()).toBe(2);

    // if a user clicks on the "monday" checkbox, we should remove/hide it.
    await availabilityCard3.findScheduleCheckbox("Mon").click(); // click the checkbox

    // the monday day card and its timeslots shouldn't be visible.
    expect(await availabilityCard3.findDayCards().count()).toBe(1);

    // the form should be still valid
    await pageObject.checkPageValidity(true);
  });

  await test.step("view all availabilities", async () => {
    // 3 items on mount
    expect(await pageObject.availabilityCards.count()).toBe(3);

    // check fields
    expect(await pageObject.findAvailabilityCard(0).findTitle().textContent()).toContain("Mock Availability 1");
    expect(await pageObject.findAvailabilityCard(0).findNameInput().inputValue()).toContain("Mock Availability 1");
    expect(await pageObject.findAvailabilityCard(0).findDatesFrom().textContent()).toContain("06/01/2023");
    expect(await pageObject.findAvailabilityCard(0).findDatesTo().textContent()).toContain("07/01/2023");

    // check schedule days checkboxes
    const resultsPromises = SHORT_DAY_NAMES.map(async (dayName) => {
      const dayIsDisabled = await pageObject.findAvailabilityCard(0).findScheduleCheckbox(dayName).isDisabled();
      return { dayName, dayIsDisabled };
    });

    const results = await Promise.all(resultsPromises);
    results.forEach(({ dayName, dayIsDisabled }) => {
      if (dayName === "Sat" || dayName === "Fri") {
        expect(dayIsDisabled).toBe(false);
      } else {
        expect(dayIsDisabled).toBe(true);
      }
    });

    await test.step("timeslots", async () => {
      await test.step("view all time slots", async () => {
        expect(await pageObject.findAvailabilityCard(0).findDayCards().count()).toBe(2);
      });

      const tuesdayCard = pageObject.findAvailabilityCard(0).findDayCard(0);

      const lastTimeSlot = tuesdayCard.findTimeSlot(1);

      await test.step("clear a time slot", async () => {
        expect(await lastTimeSlot.findPricingInput().innerText()).toBe("Mock pricing 1");

        await lastTimeSlot.findClear().click();

        expect(await lastTimeSlot.findPricingInput().innerText()).toContain("pricing.dropdown.placeholder");
      });

      await test.step("Copy settings to other days", async () => {
        const availability = pageObject.findAvailabilityCard(0);
        expect(await availability.findDayCard(0).findTimeSlot(1).findPricingInput().innerText()).toContain(
          "pricing.dropdown.placeholder"
        );
        expect(await availability.findDayCard(1).findTimeSlot(1).findPricingInput().innerText()).toContain(
          "Mock pricing 1"
        );

        await pageObject.findAvailabilityCard(0).findDayCard(1).findCopySettings().click();

        await page.getByTestId("copy-settings-select-all-btn").click();
        await page.getByTestId("copy-settings-copy-btn").click();

        expect(await availability.findDayCard(0).findTimeSlot(1).findPricingInput().innerText()).toContain(
          "Mock pricing 1"
        );
        expect(await availability.findDayCard(1).findTimeSlot(1).findPricingInput().innerText()).toContain(
          "Mock pricing 1"
        );
      });
    });
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

    // the form should not be valid
    await pageObject.checkPageValidity(false);
  });

  await test.step("clear an availability", async () => {
    // add a new availability
    await pageObject.findAddAvailabilityButton().click();

    // type something
    await pageObject.findAvailabilityCard(0).findNameInput().fill("Hello there");

    // check the input value
    expect(await pageObject.findAvailabilityCard(0).findNameInput().inputValue()).toBe("Hello there");

    // click the clear icon
    await pageObject.findAvailabilityCard(0).findClearButton().click();

    // name field should be empty
    expect(await pageObject.findAvailabilityCard(0).findNameInput().inputValue()).toBe("");
  });

  await test.step("delete an availability", async () => {
    // 5 items so far
    expect(await pageObject.availabilityCards.count()).toBe(5);

    // click the delete icon of the first item
    await pageObject.findAvailabilityCard(0).findDeleteButton().click();
    await pageObject.findByTestId(selectors.modalConfirm).click();

    // wait for modal to close
    await pageObject.findByTestId(selectors.modalConfirm).isHidden();
    await page.waitForSelector(testId("AvailabilityIndexPage"));

    // the item should be deleted
    expect(await pageObject.availabilityCards.count()).toBe(4);
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
