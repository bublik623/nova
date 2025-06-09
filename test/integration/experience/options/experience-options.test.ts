import { test, expect } from "@playwright/test";
import { ExperienceOptionPage } from "./experience-options.fixture";
import mockApi from "./experience-options.mocks";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { startsWithTestId } from "@/utils/test.utils";

let optionsPage: ExperienceOptionPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, ExperienceType.CALENDAR_NO_TIMESLOTS);

  optionsPage = new ExperienceOptionPage(page);
});
const baseOptionRawUrl = "/experience/test-experience-id/options/raw/test-option-id";
const baseOptionCurationUrl = "/experience/test-experience-id/options/curation/test-option-id";

test("the raw flow works correctly", async () => {
  await optionsPage.navigateTo("/experience/test-experience-id/options/raw/test-option-id/option-settings");
  await optionsPage.waitFor("[data-testid=option_name-input-text-container]");

  // check the left sidebar link
  expect(await optionsPage.page.getByTestId("options-go-back-button"));
  expect(await optionsPage.isLinkVisible(`${baseOptionRawUrl}/pricing?view=all`));
  expect(await optionsPage.isLinkVisible(`${baseOptionRawUrl}/availability?view=all`));

  await test.step("the go to next section button navigates to the pricing page", async () => {
    await optionsPage.goToNextSectionButton().click();

    await optionsPage.page.waitForURL("/experience/test-experience-id/options/raw/test-option-id/pricing");
  });

  await test.step("the go to next section button navigates to the availability page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL("/experience/test-experience-id/options/raw/test-option-id/availability");
  });

  await test.step("the go to next section button navigates to the costumer details page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL(
      "/experience/test-experience-id/options/raw/test-option-id/customer-details"
    );
  });

  await test.step("the go to next section button navigates to the pickups page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL("/experience/test-experience-id/options/raw/test-option-id/pickups");
  });

  await test.step("it should complete the option", async () => {
    await optionsPage.findByTestId("document-action-bar-complete-option").click();
    await expect(optionsPage.page).toHaveURL("/experience/test-experience-id/raw/options");
  });
});

test("curation flow", async () => {
  await optionsPage.navigateTo("/experience/test-experience-id/options/curation/test-option-id/option-settings");
  await optionsPage.waitFor("[data-testid=option_name-input-text-container]");

  // check the labels
  expect(
    await optionsPage.findByTestId("nova-label").getByText("experience.curation.view-type.commercial").count()
  ).toBe(1);

  // check the left sidebar link

  expect(await optionsPage.page.getByTestId("options-go-back-button"));
  expect(await optionsPage.isLinkVisible(`${baseOptionCurationUrl}/pricing?view=all`));
  expect(await optionsPage.isLinkVisible(`${baseOptionCurationUrl}/availability?view=all`));

  await test.step("the go to next section button navigates to the pricing page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL("/experience/test-experience-id/options/curation/test-option-id/pricing");
  });

  await test.step("the go to next section button navigates to the availability page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL(
      "/experience/test-experience-id/options/curation/test-option-id/availability"
    );
  });

  await test.step("the go to next section button navigates to the costumer details page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL(
      "/experience/test-experience-id/options/curation/test-option-id/customer-details"
    );
  });

  await test.step("the go to next section button navigates to the pickups page", async () => {
    await optionsPage.goToNextSectionButton().click();
    await expect(optionsPage.page).toHaveURL("/experience/test-experience-id/options/curation/test-option-id/pickups");
  });

  // check the filtering(all-curation-setup check)

  const filter = optionsPage.findByTestId("document-sidebar-view-select");
  const filterListItem = optionsPage.findByStartsWithTestId("options-list-list-item");
  expect(await filter.isVisible()).toBeTruthy();

  expect(await optionsPage.isLinkVisible(`${baseOptionCurationUrl}/pricing?view=all`));
  expect(await optionsPage.isLinkVisible(`${baseOptionCurationUrl}/option-settings?view=all`));
  expect(await optionsPage.findByTestId("sidebar-section-button").count()).toBe(5);

  await filter.click();
  await optionsPage.waitFor(startsWithTestId("options-list-list-item"));

  await filterListItem.nth(1).click();

  await optionsPage.page.waitForURL(
    "/experience/test-experience-id/options/curation/test-option-id/pickups?view=commercial"
  );

  expect(await optionsPage.findByTestId("sidebar-section-button").count()).toBe(1);

  expect(await optionsPage.findByTestId("sidebar-sections").count()).toBe(1);
  await filter.click();
  await filterListItem.nth(0).click();

  expect(await optionsPage.findByTestId("sidebar-section-button").count()).toBe(5);

  await optionsPage.findByTestId("sidebar-section-wrapper-availability").getByTestId("sidebar-section-title").click();

  await test.step("it should complete the option", async () => {
    await optionsPage.findByTestId("document-action-bar-complete-option").click();
    await optionsPage.page.waitForURL("/experience/test-experience-id/curation/options");
  });
});

// skipped because its flaky
// todo fix it. task on jira: OFF-3532
test.skip("The unsaved changes modal works correctly", async () => {
  const { page } = optionsPage;
  const URL = "/experience/test-experience-id/options/raw/test-option-id";
  await optionsPage.navigateTo(URL + "/option-settings");

  await test.step("it works in options setting", async () => {
    await page.getByTestId("option_name-input-text").fill("TEST OPTION NOVA 1!");

    await page.waitForTimeout(200); // wait for validation
    await page.getByTestId("sidebar-section-wrapper-pricing").getByTestId("sidebar-section-title").click();
    await page.getByTestId("modal-leave-btn").click();
  });

  await test.step("it works in pricing", async () => {
    await page.getByTestId("pricing-name-input-text").first().fill("My pricing!!!");

    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill("My pricing 1!!!");

    await page.getByTestId("sidebar-section-wrapper-availability").getByTestId("sidebar-section-title").click();
    await page.getByTestId("modal-leave-btn").click();
  });

  await test.step("it works in availability", async () => {
    await page.waitForTimeout(300); // the page doesnt open immediately for some reason
    await page
      .getByRole("textbox", { name: "experience.title.input.placeholder" })
      .fill("Mock Availability 1 fri-s!at,lang:no,cap:unlimited");

    await page.getByTestId("sidebar-section-wrapper-customer_details").getByTestId("sidebar-section-title").click();
    await page.getByTestId("modal-leave-btn").click();
  });

  await test.step("it works in customer details", async () => {
    // this wouldn't be needed if the form emitted the unsaved changes correctly
    await page.waitForSelector('[data-testid="question-ask-for-all"]'); // we first need to wait for the form to load
    await page.waitForTimeout(100); // then for the debounced timeout for first load to switch on
    await page.getByTestId("question-ask-for-all").first().click();
    await page.waitForTimeout(100); // then we can await the debounce again and the unsaved change will register

    await page.getByTestId("options-go-back-button").click();

    await page.getByTestId("modal-leave-btn").click();

    await page.getByText("TEST OPTION NOVA 1").click();
  });
});

test("the pricing type changes works correctly", async () => {
  const { page } = optionsPage;
  const URL = "/experience/test-experience-id/options/raw/test-option-id";
  await optionsPage.navigateTo(URL + "/option-settings");

  await page.getByText("options.pricing-definition.group.title").click();
  await page.getByTestId("document-action-bar-save-content").click();
  await page.getByText("experience.options.pricing_changes_modal.title").click();
  await page.getByText("experience.options.pricing_changes_modal.description").click();

  await page.getByTestId("modal-save-btn").click();

  await page
    .getByTestId("nova-toast")
    .locator("div")
    .filter({ hasText: "notifications.generic.success.titlenotifications.success.saving.document" })
    .first()
    .click();
});
