import { test, expect } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { ExperienceRawPage } from "../experience-raw.fixture";

const selectors = {
  options: "experience-options-index-option",
  editIcon: ".IconButton>>nth=0",
  deleteIcon: ".IconButton>>nth=1",
  createButton: "experience-options-index-create-option",
  optionsSettingsPage: "#OptionsSettingsPage",
  modalConfirm: "modal-save-btn",
  modalCancel: "modal-leave-btn",
  pricingRerouteIcon: "[data-testid='pricing-table-reroute']",
  availabilityRerouteIcon: "[data-testid='availability-table-reroute']",
};

let rawPage: ExperienceRawPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/raw/options");
  await page.getByTestId("raw-options-settings");

  rawPage = new ExperienceRawPage(page);
});

test("the user should be able to create a new option", async () => {
  await test.step("clicking the button should display the modal", async () => {
    await rawPage.findByTestId(selectors.createButton).click();
    await expect(rawPage.page.getByTestId("modal-create-option-input-text")).toBeVisible();
  });

  await test.step("the modal should create the new option", async () => {
    await rawPage.page.getByTestId("modal-create-option-input-text").fill("Hello world!");
    await rawPage.page.getByTestId("modal-create-option-create-button").click();

    await rawPage.page.waitForURL("/experience/test-id/options/raw/test-option-id-1/option-settings");
  });
});

test("the user should be able to see all existing options", async () => {
  const options = rawPage.findByTestId(selectors.options);

  const optionsToCheck = [
    {
      option: options.nth(0),
      title: "TEST OPTION NOVA 1",
      time: "1 day 2 hours 3 minutes",
      capacity: "experience.option.capacity.unlimited.description",
    },
    {
      option: options.nth(2),
      title: "TEST OPTION NOVA 3",
      time: "experience.option.duration.not-set",
      capacity: "experience.option.capacity.limited.description",
    },
  ];

  for (const element of optionsToCheck) {
    const { option, title, time, capacity } = element;

    await expect(option).toContainText(title);

    await option.click();

    await expect(option).toContainText(time);
    await expect(option).toContainText(capacity);
    await expect(option).toContainText("experience.option.pricing.title");
    await expect(option).toContainText("experience.option.availability.title");

    await expect(option).toContainText("My pricing 1");
    await expect(option).toContainText("adult 20 - 30");
    await expect(option).toContainText("child 0 - 1");
    await expect(option).toContainText("youth 5 - 15");
    await expect(option).toContainText("infant 2 - 3");
    await expect(option).toContainText("20");

    await expect(option).toContainText("availability-name");
    await expect(option).toContainText("12/29/2022 - 1/2/2023");
    await expect(option).toContainText("common.expired"); // expired label
    await expect(option).toContainText("common.monday.short");
    await expect(option).toContainText("common.tuesday.short");
    await expect(option).toContainText("common.friday.short");
    await expect(option).toContainText("common.saturday.short");
  }

  const editIcon = optionsToCheck[1].option.locator(selectors.editIcon);

  await editIcon.click();
  await rawPage.waitForSelector(selectors.optionsSettingsPage);

  expect(rawPage.url).toContain("/experience/test-id/options/raw/test-option-id-3/option-settings");

  // test edit pricing button
  await rawPage.findByTestId("options-go-back-button").click();

  const pricingRerouteIcon = optionsToCheck[0].option.locator(selectors.pricingRerouteIcon);

  await pricingRerouteIcon.click();
  await rawPage.page.waitForURL("/experience/test-id/options/raw/test-option-id-1/pricing");

  expect(rawPage.url).toContain("/experience/test-id/options/raw/test-option-id-1/pricing");

  // test edit availability button
  await rawPage.findByTestId("options-go-back-button").click();

  const availabilityRerouteIcon = optionsToCheck[0].option.locator(selectors.availabilityRerouteIcon);

  await availabilityRerouteIcon.click();

  await rawPage.page.waitForURL("/experience/test-id/options/raw/test-option-id-1/availability");

  // Check the pickup table
  await rawPage.page.goBack();

  await Promise.all([
    expect(rawPage.page.getByText("experience.options.pickup.title").first()).toBeVisible(),
    expect(rawPage.page.getByText("experience.options.pickup.name").first()).toBeVisible(),
    expect(rawPage.page.getByText("experience.options.pickup.address").first()).toBeVisible(),
    expect(rawPage.page.getByText("place1").first()).toBeVisible(),
    expect(rawPage.page.getByText("address1").first()).toBeVisible(),
    expect(rawPage.page.getByText("place2").first()).toBeVisible(),
    expect(rawPage.page.getByText("address2").first()).toBeVisible(),
  ]);

  await rawPage.page.getByTestId("pickup-table-reroute").first().click();
  await rawPage.page.waitForURL("/experience/test-id/options/raw/test-option-id-1/pickups");

  // Check the customer details table
  await rawPage.page.goBack();

  await Promise.all([
    expect(rawPage.page.getByText("experience.options.customer-details.title").first()).toBeVisible(),
    expect(rawPage.page.getByText("experience.options.customer-details.details").first()).toBeVisible(),
    expect(rawPage.page.getByText("experience.options.customer-details.section").first()).toBeVisible(),
    expect(rawPage.page.getByText("experience.customer-details.category.main").first()).toBeVisible(),
    expect(rawPage.page.getByText("First name?, Last name?").first()).toBeVisible(),
  ]);

  await rawPage.page.getByTestId("customer-details-table-reroute").first().click();
  await rawPage.page.waitForURL("/experience/test-id/options/raw/test-option-id-1/customer-details");
});

test("the user should be able to hide/show expired availabilities", async () => {
  const expiredAvailability = rawPage.findByTestId("expired-availability-label").first();
  await expect(expiredAvailability).toBeVisible();

  const expiredAvailabilityToggle = rawPage.findByTestId("hide-expired-availability-toggle");
  await expect(expiredAvailabilityToggle).toBeVisible();

  await expiredAvailabilityToggle.click();
  await expect(expiredAvailability).not.toBeVisible();

  const emptyAvailabilitiesPlaceholder = rawPage.findByTestId("empty-expired-availabilities-placeholder").first();

  await expect(emptyAvailabilitiesPlaceholder).toBeVisible();
});

test("sorting availabilities", async ({ page }) => {
  await test.step("the user should be able to sort availabilities by name", async () => {
    const sortButton = page.locator('[data-testid="sort-availabilities-by-name-btn"]').first();
    await expect(sortButton).toBeVisible();

    const firstCellLocator = '[data-testid="availability-recap-table"] tbody tr:first-child td:first-child';
    let firstAvailability = await page.locator(firstCellLocator).first().textContent();
    expect(firstAvailability).toBe("availability-name");

    await sortButton.click();

    firstAvailability = await page.locator(firstCellLocator).first().textContent();
    expect(firstAvailability).toBe("Another availability name");
  });

  await test.step("the user should be able to sort availabilities by dates", async () => {
    const sortButton = page.locator('[data-testid="sort-availabilities-by-dates-btn"]').first();
    await expect(sortButton).toBeVisible();

    const firstDateCellLocator =
      '[data-testid="availability-recap-table"] tbody tr:first-child td:nth-child(2) span:first-child';
    let firstDateRange = await page.locator(firstDateCellLocator).first().textContent();
    expect(firstDateRange).toBe("1/5/2024 - 4/10/2024");

    await sortButton.click();

    firstDateRange = await page.locator(firstDateCellLocator).first().textContent();
    expect(firstDateRange).toBe("1/5/2021 - 1/10/2021");
  });
});

test("the user should be able to delete an option", async () => {
  const options = rawPage.findByTestId(selectors.options);

  const cancelButton = rawPage.findByTestId(selectors.modalCancel);
  const confirmButton = rawPage.findByTestId(selectors.modalConfirm);
  const option = options.nth(0);
  const deleteIcon = option.locator(selectors.deleteIcon);

  await deleteIcon.click();
  await cancelButton.click();

  const originalCount = await options.count();

  await deleteIcon.click();
  await confirmButton.click();

  await rawPage.page.waitForResponse((res) => res.url().includes("/options?experience=test-id"));

  expect(await options.count()).toBe(originalCount - 1);
});
