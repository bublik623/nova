import { test, expect } from "@playwright/test";
import { StopSalesPage } from "@/test/integration/stop-sales/stop-sales.fixture";
import mockApi from "@/test/integration/stop-sales/stop-sales.mocks";
import { inventoryServiceUrl } from "@/test/integration/experience/raw/experience-raw.mocks";

let stopSalesPage: StopSalesPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto("/stop-sales");
  stopSalesPage = new StopSalesPage(page);
  await stopSalesPage.waitForLoad();
});

test("detail view", async ({ page }) => {
  expect(await stopSalesPage.searchButton.isEnabled()).toBe(false);

  //assert that all the filters excepct destination are not enabled
  expect(await stopSalesPage.destinationFilter.isEnabled()).toBe(true);
  expect(await stopSalesPage.experiencesFilter.isEnabled()).toBe(false);
  expect(await stopSalesPage.optionsFilter.isEnabled()).toBe(false);
  expect(await stopSalesPage.datesFilter.isEnabled()).toBe(false);
  expect(await stopSalesPage.timeSlotsFilter.isEnabled()).toBe(false);

  expect(await stopSalesPage.searchButton.isEnabled()).toBe(false);

  await test.step("the user can click the destination filter and select an item", async () => {
    await stopSalesPage.destinationFilter.click();

    // for test data
    const checkboxDestination = await stopSalesPage.findCheckboxByLabel("Dubrovnik");
    await checkboxDestination.click();

    // select the first checkbox
    await stopSalesPage.firstCheckbox.click();

    expect(await stopSalesPage.firstCheckbox.innerText()).toBe("Alicante");
  });

  await test.step("the user can click the experiences filter and select an item", async () => {
    await stopSalesPage.experiencesFilter.click();

    // for test data
    const checkboxExperience = await stopSalesPage.findCheckboxByLabel("Explore Dubrovnik's Old Town");
    await checkboxExperience.click();

    //select the first experience option
    await stopSalesPage.firstCheckbox.click();

    expect(await stopSalesPage.optionsFilter.isEnabled()).toBe(true);
  });

  await test.step("the user can click the options filter and select an item", async () => {
    await stopSalesPage.optionsFilter.click();
    //select the first options option
    await stopSalesPage.firstCheckbox.click();

    expect(await stopSalesPage.datesFilter.isEnabled()).toBe(true);
  });

  await test.step("the user can click the date filter and select a date range", async () => {
    //0 means you are selecting the current day, while 5 means the offset of the end date, so 5 days from current
    await stopSalesPage.selectDateRange(0);

    expect(await stopSalesPage.timeSlotsFilter.isEnabled()).toBe(true);
  });

  await test.step("the user can click the timeslot filter", async () => {
    await stopSalesPage.timeSlotsFilter.click();
    await stopSalesPage.firstCheckbox.click();
    expect(await stopSalesPage.searchButton.isEnabled()).toBe(true);
  });

  await test.step("the user can see the table once the search button is clicked", async () => {
    await stopSalesPage.searchButton.click();
    expect(await stopSalesPage.table.isVisible()).toBe(true);
  });

  await test.step("the user can toggle slot's visibility by clicking the according radio button", async () => {
    expect(await stopSalesPage.inputRadioAll.isChecked());
    const slot = stopSalesPage.findByTestId("nova-collapse-content");
    expect(await slot.locator("table").count()).toBe(11);
    await stopSalesPage.inputRadioClosed.click();
    expect(await slot.locator("table").count()).toBe(4);
    await stopSalesPage.inputRadioAll.click();
  });

  await test.step("should show correct data", async () => {
    const row = page.locator("tr", { hasText: "Explore Dubrovnik's Old Town" }).first();
    await expect(row.locator('[data-testid="cell-ref-code"]')).toHaveText("EXP00001");
    await expect(row.locator('[data-testid="cell-experience-name"]')).toHaveText("Explore Dubrovnik's Old Town");
    await expect(row.locator('[data-testid="cell-option-name"]')).toHaveText("test option-1");
    await expect(row.locator('[data-testid="cell-time"]')).toHaveText("02:04");
    await expect(row.locator('[data-testid="cell-capacity"]')).toHaveText("stop_sales.table-row.capacity.shared");
    await expect(row.locator('[data-testid="cell-booked"]')).toHaveText("0");
    await expect(row.locator('[data-testid="cell-available"]')).toHaveText("15");
    await expect(row.locator('[data-testid="cell-total"]')).toHaveText("15");
  });

  await test.step("the user can select all the items in the table", async () => {
    expect(await stopSalesPage.closeSelectedButton.isEnabled()).toBe(false);
    await stopSalesPage.multiSelectCheckbox.click();
    expect(await stopSalesPage.closeSelectedButton.isEnabled()).toBe(true);
  });

  await test.step("the user change timeslot capacity", async () => {
    const requestPromise = page.waitForRequest(`${inventoryServiceUrl}/slots/update-capacity*`);
    await stopSalesPage.updateSlotCapacity(0, 50);
    const request = await requestPromise;
    expect(request.postDataJSON()).toEqual({
      id: "timeslot-1",
      capacity: 50,
    });
  });

  await test.step("the user change slot status", async () => {
    const requestPromise = page.waitForRequest(`${inventoryServiceUrl}/slots/enabling`);
    await stopSalesPage.updateSlotStatus(0);
    const request = await requestPromise;
    expect(request.postDataJSON()).toEqual({
      timeslice_ids: ["timeslice-1"],
      enable: false,
    });
  });
});

test("overview view", async ({ page }) => {
  await stopSalesPage.destinationFilter.click();
  await stopSalesPage.firstCheckbox.click();
  await stopSalesPage.experiencesFilter.click();
  await stopSalesPage.firstCheckbox.click();
  await stopSalesPage.checkboxSelectAllFilter.click();
  await stopSalesPage.optionsFilter.click();
  await stopSalesPage.firstCheckbox.click();
  await stopSalesPage.selectDateRange(0);
  await stopSalesPage.timeSlotsFilter.click();
  await stopSalesPage.firstCheckbox.click();
  expect(await stopSalesPage.searchButton.isEnabled()).toBe(true);
  await stopSalesPage.searchButton.click();
  await stopSalesPage.buttonViewType.click();
  await stopSalesPage.optionOverview.click();

  await test.step("the user can see the experience overview", async () => {
    expect(await stopSalesPage.cardExperience.count()).toBeGreaterThan(0);
    expect(await page.getByRole("heading", { name: "Closed Experience Test" }).count()).toBe(1);
    expect(await page.getByRole("heading", { name: "Closed Option Test" }).count()).toBe(1);

    // toggle the option card - open
    const optionCard = stopSalesPage.cardOption.first();
    await optionCard.click();

    expect(await stopSalesPage.checkboxTimeslice.nth(0).isVisible()).toBe(true);
    expect(await stopSalesPage.checkboxTimeslice.nth(1).isVisible()).toBe(true);
    await optionCard.click();
  });

  await test.step("the user can select all experiences", async () => {
    await stopSalesPage.checkboxSelectAllItems.click();
    const allExperienceCheckboxes = await stopSalesPage.checkboxExperience.all();

    for (const checkbox of allExperienceCheckboxes) {
      expect(await checkbox.getAttribute("aria-checked")).toBe("true");
    }
  });

  await test.step("selecting an experience activates the open-selected button", async () => {
    // deselect everything
    await stopSalesPage.checkboxSelectAllItems.click();

    await expect(stopSalesPage.buttonOpenSelected).toBeDisabled();

    const experienceCheckbox = stopSalesPage.checkboxExperience.first();
    await experienceCheckbox.click();

    await expect(stopSalesPage.buttonOpenSelected).toBeEnabled();
  });

  await test.step("user can expand an option card to see timeslices", async () => {
    const experienceCard = stopSalesPage.cardExperience.first();
    const optionCard = experienceCard.getByTestId("card-option").first();
    await optionCard.click();

    expect(await stopSalesPage.checkboxTimeslice.nth(0).isVisible()).toBe(true);
    expect(await stopSalesPage.checkboxTimeslice.nth(1).isVisible()).toBe(true);
  });

  await test.step("checkbox states and select all functionality in overview view", async () => {
    // deselect everything
    await stopSalesPage.checkboxSelectAllItems.click();

    await test.step("all checkboxes are initially unchecked", async () => {
      const allCheckboxes = stopSalesPage.checkboxExperience;
      for (const checkbox of await allCheckboxes.all()) {
        await expect(checkbox).not.toBeChecked();
      }
    });

    await test.step("selecting all experiences checks all experience checkboxes", async () => {
      await stopSalesPage.checkboxSelectAllItems.click();

      const experienceCheckboxes = stopSalesPage.checkboxExperience;
      for (const checkbox of await experienceCheckboxes.all()) {
        expect(await checkbox.getAttribute("aria-checked")).toBe("true");
      }
    });

    await test.step("deselecting one timeslice creates indeterminate state for select all checkboxes", async () => {
      const timeslice1 = await stopSalesPage.checkboxTimeslice.nth(0);

      await timeslice1.click();

      await expect(stopSalesPage.checkboxSelectAllItems).toHaveJSProperty("indeterminate", true);
      await expect(stopSalesPage.checkboxExperience.first()).toHaveJSProperty("indeterminate", true);
      await expect(stopSalesPage.checkboxOption.first()).toHaveJSProperty("indeterminate", true);
    });
  });
});
