import { test, expect } from "@playwright/test";
import { ExperienceAvailabilityPage, selectors } from "../availability.fixture";
import mockApi, { offerServiceURL } from "../availability.mocks";
import { mockDatetimeAvailabilities, mockOfferExperience } from "../availability.data";
import { testId } from "@/utils/test.utils";
import { SHORT_DAY_NAMES } from "@/constants/date.constants";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

let mockAvailabilitiesResponse = [...mockDatetimeAvailabilities];
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
            ...mockOfferExperience(ExperienceType.CALENDAR_TIMESLOTS),
          }),
        });
        break;
      default:
        throw new Error(`No mocked route for ${req.method()} - ${req.url()}`);
    }
  });

  await page.route(`${offerServiceURL}/datetime-tickets*`, async (route, req) => {
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
  await page.route(`${offerServiceURL}/datetime-tickets/*`, async (route, req) => {
    if (req.method() === "DELETE") {
      const itemId = req.url().split("/").pop();
      // delete the pricing from our mock response
      mockAvailabilitiesResponse = mockAvailabilitiesResponse.filter((item) => item.id !== itemId);
      await route.fulfill({ status: 201, body: JSON.stringify({}) });
    }
  });

  await page.goto("/experience/test-experience-datetime/options/raw/test-option-id/availability");
  await page.waitForSelector(testId("AvailabilityIndexPage"));

  pageObject = new ExperienceAvailabilityPage(page);
});

test("Availability Page - Datetime Ticket", async ({ page }) => {
  await test.step("hide a day in schedule", async () => {
    // the mocked availability card `3`(last item on the list) has 2 day cards (monday and tuesday)
    const availabilityCard3 = pageObject.findAvailabilityCard(2);
    await availabilityCard3.findTitle().click();
    expect(await availabilityCard3.findDayCards().count()).toBe(2);

    // if a user clicks on the "monday" checkbox, we should remove/hide it.
    await availabilityCard3.findScheduleCheckbox("Mon").click(); // click the checkbox

    // the monday day card and its timeslots shouldn't be visible.
    expect(await availabilityCard3.findDayCards().count()).toBe(1);

    // the form should still be valid
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
        // 2 timeslots
        expect(await pageObject.findAvailabilityCard(0).findDayCards().count()).toBe(2);
      });

      const tuesdayCard = pageObject.findAvailabilityCard(0).findDayCard(0);
      const saturdayCard = pageObject.findAvailabilityCard(0).findDayCard(1);

      const lastTimeSlot = await test.step("add new time slot", async () => {
        expect(await tuesdayCard.findTimeSlots().count()).toBe(2);

        await tuesdayCard.findAddTimeSlotButton().click();

        expect(await tuesdayCard.findTimeSlots().count()).toBe(3);
        const lastTimeSlot = tuesdayCard.findTimeSlot(3);
        await pageObject.selectTimeslotHour(lastTimeSlot, "12");
        await pageObject.selectTimeslotMinutes(lastTimeSlot, "30");

        return lastTimeSlot;
      });

      await test.step("Copy settings to other days", async () => {
        const tuesdayTimeslots = tuesdayCard.findTimeSlots();
        const saturdayTimeslots = saturdayCard.findTimeSlots();

        expect(await tuesdayTimeslots.count()).toBe(3);
        expect(await pageObject.checkTimeslot(tuesdayCard.findTimeSlot(1), "09", "00", "Mock pricing 1"));
        expect(await pageObject.checkTimeslot(tuesdayCard.findTimeSlot(2), "10", "00", "Mock pricing 1"));
        expect(await pageObject.checkTimeslot(tuesdayCard.findTimeSlot(3), "12", "30"));

        expect(await saturdayTimeslots.count()).toBe(1);
        expect(await pageObject.checkTimeslot(saturdayCard.findTimeSlot(1), "09", "00", "Mock pricing 1"));

        await tuesdayCard.findCopySettings().click();
        await page.getByTestId("copy-settings-select-all-btn").click();
        await page.getByTestId("copy-settings-copy-btn").click();

        await tuesdayCard.findTimeSlot(1).findHourInput().click();
        expect(await saturdayTimeslots.count()).toBe(3);
        expect(await pageObject.checkTimeslot(saturdayCard.findTimeSlot(1), "09", "00", "Mock pricing 1"));
        expect(await pageObject.checkTimeslot(saturdayCard.findTimeSlot(2), "10", "00", "Mock pricing 1"));
        expect(await pageObject.checkTimeslot(saturdayCard.findTimeSlot(3), "12", "30"));
      });

      await test.step("add a time slot", async () => {
        await tuesdayCard.findAddTimeSlotButton().click();

        await test.step("languages dropdown should be pre-selected correctly", async () => {
          // mock data test/integration/experience/options/availability/availability.data.ts mockOptionData. About Uppercase first letter (capitalizeFirstLetter in LanguagesDropdown.vue)
          expect(await tuesdayCard.findTimeSlot(4).findLanguagesDropdownTrigger().textContent()).toContain("En, Fr");
        });

        expect(await tuesdayCard.findTimeSlots().count()).toBe(4);

        // Fill with invalid time (we cannot have two slots with the same time)
        const lastTimeSlot = tuesdayCard.findTimeSlot(4);
        await pageObject.selectTimeslotHour(lastTimeSlot, "12");
        await pageObject.selectTimeslotMinutes(lastTimeSlot, "30");

        // Check validation
        await page.waitForSelector("text=experience.availability.timeslots.error.overlapping");

        // Set correct time and check again
        await pageObject.selectTimeslotHour(lastTimeSlot, "15");
        await pageObject.selectTimeslotMinutes(lastTimeSlot, "30");
        expect(await page.getByTestId("availability-overlapping-timeslots-error").first().isVisible()).toBe(false);
      });

      await test.step("clear a time slot", async () => {
        expect(await lastTimeSlot.findHourInput().inputValue()).toBe("12");
        expect(await lastTimeSlot.findMinutesInput().inputValue()).toBe("30");

        await lastTimeSlot.findClear().click();

        expect(await lastTimeSlot.findHourInput().inputValue()).toBe("");
        expect(await lastTimeSlot.findMinutesInput().inputValue()).toBe("");
      });

      await test.step("delete a time slot", async () => {
        // 4 time slots
        expect(await tuesdayCard.findTimeSlots().count()).toBe(4);

        // delete the last item
        await lastTimeSlot.findDelete().click();
        await pageObject.findByTestId(selectors.modalConfirm).click();

        // should be removed
        expect(await tuesdayCard.findTimeSlots().count()).toBe(3);
      });

      await test.step("duplicate a time slot", async () => {
        expect(await tuesdayCard.findTimeSlots().count()).toBe(3);

        // open the duplicate modal
        const secondTimeSlot = tuesdayCard.findTimeSlot(2);
        await secondTimeSlot.findOpenDuplicateModal().click();

        // update the duplicate settings (in the duplicate modal)
        await secondTimeSlot.findDuplicateEveryInput().fill("5");
        await secondTimeSlot.findDuplicateHourInput().fill("24");
        await secondTimeSlot.findDuplicateMinutesInput().fill("0");
        await secondTimeSlot.findSaveDuplicateBtn().click();

        // we should have 2 more time slots, 15:00 and 20:00
        expect(await tuesdayCard.findTimeSlots().count()).toBe(5);

        // 15:00
        expect(await tuesdayCard.findTimeSlot(4).findHourInput().inputValue()).toBe("15");
        expect(await tuesdayCard.findTimeSlot(4).findMinutesInput().inputValue()).toBe("00");

        // 20:00
        expect(await tuesdayCard.findTimeSlot(5).findHourInput().inputValue()).toBe("20");
        expect(await tuesdayCard.findTimeSlot(5).findMinutesInput().inputValue()).toBe("00");
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

    // the form should not be valid anymore
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
