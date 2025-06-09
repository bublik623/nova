import { test, expect } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { AgendaPage } from "./agenda.fixture";
import { PricingDefinition } from "@/types/Options";

const nextMonthDate = new Date();
nextMonthDate.setDate(15);
nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
const nextMonth = `${nextMonthDate.getMonth() + 1}`.padStart(2, "0");
const yearOfNextMonth = nextMonthDate.getFullYear();

let agendaPage: AgendaPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA", PricingDefinition.PERSON);

  await page.goto("/experience/test-id/raw/agenda");
  await page.waitForSelector("#agenda");

  agendaPage = new AgendaPage(page);
});

test("the user should be able to see and navigate the selected experience's agenda", async () => {
  expect(await agendaPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");

  // Check that the amount of fields matches
  expect(await agendaPage.formSection.count()).toBe(1);
});

test("the user should be able to filter and see the slots", async () => {
  expect(await agendaPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");
  await agendaPage.findByTestId("document-action-bar-close").click();

  await test.step("select a date range and apply the filters", async () => {
    await agendaPage.find(".DateInput__input").nth(0).click();
    await agendaPage.waitForSelector(".NovaInputDate__calendar-modal");

    await agendaPage.findByTestId("next-month").click();
    await agendaPage.findByTestId("date-card").getByText("15", { exact: true }).click();
    await agendaPage.findByTestId("date-card").getByText("20").click();

    await agendaPage.checkFilters(
      `start_date=${yearOfNextMonth}-${nextMonth}-15&end_date=${yearOfNextMonth}-${nextMonth}-20`
    );
  });

  await test.step("select multiple dates and apply the filters", async () => {
    await agendaPage.filterCollapse.click();
    await agendaPage.findByTestId("radio-card-SINGLE").click();
    await agendaPage.waitForSelector(`[data-testid="nova-date-picker"]`);

    await agendaPage.findByTestId("next-month").click();
    await agendaPage.findByTestId("date-card").getByText("15", { exact: true }).click();

    await agendaPage.checkFilters(
      `start_date=${yearOfNextMonth}-${nextMonth}-15&end_date=${yearOfNextMonth}-${nextMonth}-15`
    );

    await agendaPage.filterCollapse.click();
    await agendaPage.findByTestId("date-card").getByText("20").click();
    await agendaPage.findByTestId("date-card").getByText("21").click();

    await agendaPage.checkFilters(
      `start_date=${yearOfNextMonth}-${nextMonth}-15&end_date=${yearOfNextMonth}-${nextMonth}-21&filters=date%3Din%3D(${yearOfNextMonth}-${nextMonth}-15,${yearOfNextMonth}-${nextMonth}-20,${yearOfNextMonth}-${nextMonth}-21`
    );
  });

  await test.step("select option filter and apply", async () => {
    // Set option filter
    await agendaPage.filterCollapse.click();
    await agendaPage.selectOptionFilter(1);

    await agendaPage.checkFilters("option.id%3Din%3D(option-1)");

    // Set option filter
    await agendaPage.filterCollapse.click();
    await agendaPage.selectOptionFilter(1);

    await agendaPage.checkFilters("option.id%3Din%3D(option-1,option-2)");
  });

  await test.step("select timeslot filter and apply", async () => {
    // Set option filter
    await agendaPage.filterCollapse.click();
    await agendaPage.selectTimeslotFilter(1);

    await agendaPage.checkFilters("time%3Din%3D(10:00:00)");

    // Set option filter
    await agendaPage.filterCollapse.click();
    await agendaPage.selectTimeslotFilter(1);

    await agendaPage.checkFilters("time%3Din%3D(10:00:00,09:00:00)");
  });

  await test.step("change timeslot capacity", async () => {
    await agendaPage.updateSlotCapacity(2, 50);
  });

  await test.step("select show closed items only filter", async () => {
    await agendaPage.filterCollapse.click();
    await agendaPage.selectShowClosedFilter();
    await agendaPage.checkFilters("enabled%3Din%3D(false)");
  });

  await test.step("change slot status", async () => {
    await agendaPage.updateSlotStatus(1);
  });

  await test.step("bulk status", async () => {
    await agendaPage.filterCollapse.click();
    await agendaPage.filterApplyBtn.click();

    await agendaPage.updateAllSlotsStatus(false);
  });
});

test("if an option is group type it should show the alert", async ({ page }) => {
  await mockApi(page, "NOVA", PricingDefinition.GROUP);

  await page.goto("/experience/test-id/raw/agenda");
  await page.waitForSelector("#agenda");

  expect(await agendaPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");
  await agendaPage.findByTestId("document-action-bar-close").click();
  await agendaPage.find(".DateInput__input").nth(0).click();
  await agendaPage.waitForSelector(".NovaInputDate__calendar-modal");

  await agendaPage.findByTestId("next-month").click();
  await agendaPage.findByTestId("date-card").getByText("15", { exact: true }).click();
  await agendaPage.findByTestId("date-card").getByText("20").click();

  await agendaPage.filterApplyBtn.click();

  await page.waitForSelector("[data-testid='agenda-alert-groups']");
});
