import { test, expect } from "@playwright/test";
import { ExperienceOptionPage } from "../experience-options.fixture";
import mockApi, { offerServiceURL } from "../experience-options.mocks";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";
import { Option } from "@/types/generated/OfferServiceApi";

let optionsPage: ExperienceOptionPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, ExperienceType.CALENDAR_TIMESLOTS);

  await page.goto("/experience/test-experience-id/options/raw/test-option-id/option-settings");
  await page.waitForSelector("[data-testid=option_name-input-text-container]");

  optionsPage = new ExperienceOptionPage(page);
});

test("the user should be able to see and navigate the selected option settings", async () => {
  // Check that the amount of fields matches
  expect(await optionsPage.formSection.count()).toBe(5);

  await optionsPage.checkField("option_name-input-text", "TEST OPTION NOVA 1");
  await optionsPage.checkField("option-single-duration-days", "1");
  await optionsPage.checkField("option-single-duration-hours", "2");
  await optionsPage.checkField("option-single-duration-minutes", "3");

  await optionsPage.checkRadioGroup("option-language-radio", 2);
  await optionsPage.checkRadioGroup("option-capacity-radio", 2);
});

test("the user should be able to update the selected option settings", async ({ page }) => {
  await optionsPage.findByTestId("option_name-input-text").fill("Hello world!");
  await optionsPage.findByTestId("option-single-duration-days").fill("10");

  // if the capacity type is not unlimited and the multilanguage is true
  // it should show 3 radio card
  await optionsPage.findByTestId("input-radio-shared").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(2);
  await optionsPage.isVisible("radio-card-pax", true);
  await optionsPage.isVisible("radio-card-language", true);

  await test.step("option languages dropdown", async () => {
    await test.step("dropdown should be visible", async () => {
      expect(await optionsPage.findByTestId("option-languages-trigger").isVisible()).toBe(true);
    });

    await test.step("order of languages should be correct", async () => {
      await optionsPage.findByTestId("option-languages-trigger").click();
      await expect(page.locator("#language-checkbox-en")).toBeVisible();

      const languages = await optionsPage.findByTestId("language-label").all();
      expect(await languages[0].textContent()).toContain("common.language.de");
      expect(await languages[1].textContent()).toContain("common.language.dk");
      expect(await languages[2].textContent()).toContain("common.language.en");
    });

    await test.step("selected languages should be correct", async () => {
      // mock data has two languages pre-selected "en" and "fr". see: experience-options.data.ts mockOptionsData["allowed_languages"]
      expect(await page.locator("#language-checkbox-en").getAttribute("aria-checked")).toBe("true");
      expect(await page.locator("#language-checkbox-fr").getAttribute("aria-checked")).toBe("true");
      expect(await page.locator("#language-checkbox-es").getAttribute("aria-checked")).toBe("false");
    });
  });

  // if the capacity type is not unlimited and the multilanguage is false
  // it should show 2 radio card
  await optionsPage.findByTestId("input-radio-false").click();
  await optionsPage.findByTestId("input-radio-pax").click();
  expect(await optionsPage.findByTestId("input-radio-pax").count()).toBe(2);
  await optionsPage.isVisible("radio-card-shared", true);
  await optionsPage.isVisible("radio-card-language", false);

  // if the capacity type is unlimited
  // it should not show any radio card
  await optionsPage.findByTestId("input-radio-unlimited").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(1);
  await optionsPage.isVisible("radio-card-pax", false);
  await optionsPage.isVisible("radio-card-language", false);
});

test("user should be able to save the option", async ({ page }) => {
  await test.step("saving option should update the option with the new languages", async () => {
    const requestPromise = page.waitForRequest(
      (request) => request.url().includes(`${offerServiceURL}/options/test-option-id`) && request.method() === "PUT"
    );

    // Update the languages to true
    await optionsPage.findByTestId("input-radio-true").click();

    // add one more language to trigger a change
    await optionsPage.findByTestId("option-languages-trigger").click();
    await page.locator("#language-checkbox-de").click();

    await page.getByTestId("document-action-bar-save-content").click();
    await expect(page.getByTestId("modal")).toBeVisible();
    await page.getByTestId("modal-save-btn").click();

    const request = await requestPromise;
    expect(request.postDataJSON()).toEqual({
      allowed_languages: [{ language: "en" }, { language: "fr" }, { language: "de" }],
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      id: "test-option-id-1",
      multilanguage: true,
      name: "TEST OPTION NOVA 1",
      pricing_type_allowed: "person",
      status: "DRAFT",
      capacity_type: "unlimited",
      duration: "P0Y1DT2H3M0S",
    } satisfies Option);
  });

  await test.step("if the user changes languages to false, allowed_languages should be empty", async () => {
    const requestPromise = page.waitForRequest(
      (request) => request.url().includes(`${offerServiceURL}/options/test-option-id`) && request.method() === "PUT"
    );

    // Update the languages to false to trigger a change
    await optionsPage.findByTestId("input-radio-false").click();

    await optionsPage.findByTestId("document-action-bar-save-content").click();
    await expect(page.getByTestId("modal")).toBeVisible();
    await page.getByTestId("modal-save-btn").click();

    const request = await requestPromise;
    expect(request.postDataJSON()).toEqual({
      allowed_languages: [],
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      id: "test-option-id-1",
      multilanguage: false,
      name: "TEST OPTION NOVA 1",
      pricing_type_allowed: "person",
      status: "DRAFT",
      capacity_type: "unlimited",
      duration: "P0Y1DT2H3M0S",
    } satisfies Option);
  });
});

test("if the experience type is NO-CALENDAR-FIXED-VALIDITY", async ({ page }) => {
  await page.goto("/experience/test-experience-fixed-validity/options/raw/test-option-id/option-settings");
  await page.waitForSelector("[data-testid=option_name-input-text-container]");
  await optionsPage.findByTestId("option_name-input-text").fill("Hello world!");
  await optionsPage.findByTestId("option-single-duration-days").fill("10");

  // if the capacity type is not unlimited and the multilanguage is true
  // it should show 2 radio card
  await optionsPage.findByTestId("input-radio-shared").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(2);
  await optionsPage.isVisible("radio-card-language", true);
  await optionsPage.isVisible("radio-card-pax", false);

  // if the capacity type is not unlimited and the multilanguage is false
  // it should show 1 radio card
  await optionsPage.findByTestId("input-radio-false").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(2);
  await optionsPage.isVisible("radio-card-shared", true);
  await optionsPage.isVisible("radio-card-language", false);
  await optionsPage.isVisible("radio-card-pax", false);

  // if the capacity type is unlimited
  // it should not show any radio card
  await optionsPage.findByTestId("input-radio-unlimited").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(1);
  await optionsPage.isVisible("radio-card-pax", false);
  await optionsPage.isVisible("radio-card-language", false);
});

test("if the experience type is NO-CALENDAR-FIXED-END", async ({ page }) => {
  await page.goto("/experience/test-experience-fixed-end/options/raw/test-option-id/option-settings");
  await page.waitForSelector("[data-testid=option_name-input-text-container]");
  await optionsPage.findByTestId("option_name-input-text").fill("Hello world!");
  await optionsPage.findByTestId("option-single-duration-days").fill("10");

  // if the capacity type is not unlimited and the multilanguage is true
  // it should show 2 radio card
  await optionsPage.findByTestId("input-radio-shared").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(2);
  await optionsPage.isVisible("radio-card-language", true);
  await optionsPage.isVisible("radio-card-pax", false);

  // if the capacity type is not unlimited and the multilanguage is false
  // it should show 1 radio card
  await optionsPage.findByTestId("input-radio-false").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(2);
  await optionsPage.isVisible("radio-card-shared", true);
  await optionsPage.isVisible("radio-card-language", false);
  await optionsPage.isVisible("radio-card-pax", false);

  // if the capacity type is unlimited
  // it should not show any radio card
  await optionsPage.findByTestId("input-radio-unlimited").click();
  expect(await optionsPage.findByTestId("input-radio-shared").count()).toBe(1);
  await optionsPage.isVisible("radio-card-pax", false);
  await optionsPage.isVisible("radio-card-language", false);
});

test("the dangerous changes modal should work correctly", async ({ page }) => {
  await test.step("if user changes the languages field to true, and there are availabilities, it should trigger the dangerous changes modal", async () => {
    const languagesRadioButtons = optionsPage.findByTestId("option-language-radio");
    // "No" radio button
    const noRadioButton = languagesRadioButtons.locator("input").nth(1);
    await noRadioButton.click();
    await page.getByTestId("document-action-bar-save-content").click();
    await expect(page.getByTestId("modal")).toBeVisible();
    await page.getByTestId("modal-save-btn").click();
  });

  await test.step("if the user changes capacity type, it should get a modal to cancel", async () => {
    // change to "limited"
    await page.getByText("experience.option.capacity.limited").click();
    await page.getByTestId("document-action-bar-save-content").click();

    await expect(page.getByTestId("modal")).toBeVisible();

    // close the modal with save
    await page.getByTestId("modal-save-btn").click();
  });

  await test.step("if the user changes pricing type, it should get a modal to cancel", async () => {
    // change to "group"
    await page.getByText("options.pricing-definition.group.title").click();
    await page.getByTestId("document-action-bar-save-content").click();

    await expect(page.getByTestId("modal")).toBeVisible();

    // close the modal with save
    await page.getByTestId("modal-save-btn").click();
  });

  await test.step("if the user changes allowed languages, it should get a modal to cancel", async () => {
    // Open languages dropdown
    await optionsPage.findByTestId("option-languages-trigger").click();

    // Verify initial state - en and fr should be selected
    expect(await page.locator("#language-checkbox-en").getAttribute("aria-checked")).toBe("true");
    expect(await page.locator("#language-checkbox-fr").getAttribute("aria-checked")).toBe("true");

    // add German language ( this should trigger allowedLanguages modal)
    await page.locator("#language-checkbox-de").click();

    // Save and verify that the modal is visible
    await page.getByTestId("document-action-bar-save-content").click();
    await expect(page.getByTestId("modal")).toBeVisible();
    await page.getByTestId("modal-leave-btn").click();

    // remove the "fr" language ( this should trigger the allowedLanguages modal)
    await optionsPage.findByTestId("option-languages-trigger").click();
    await page.locator("#language-checkbox-fr").click();

    // Save and verify that the modal is visible
    await page.getByTestId("document-action-bar-save-content").click();
    await expect(page.getByTestId("modal")).toBeVisible();

    // close the modal without saving changes
    await page.getByTestId("modal-leave-btn").click();
  });

  await test.step("if the user cancels and saves again, a modal should show, where the user can confirm.", async () => {
    await page.getByTestId("document-action-bar-save-content").click();
    await page.getByTestId("modal-save-btn").click();
    await expect(page.getByTestId("modal")).not.toBeVisible();
  });

  await test.step("if the user saves again with no dangerous changes, the modal should not show.", async () => {
    await page.getByTestId("document-action-bar-save-content").click();
    await expect(page.getByTestId("modal")).not.toBeVisible();
  });
});

test("if the experience type is open", async ({ page }) => {
  await mockApi(page, ExperienceType.NO_CALENDAR_FIXED_VALIDITY);

  await page.goto("/experience/test-experience-id/options/raw/test-option-id/option-settings");
  await page.waitForSelector("[data-testid=option_name-input-text-container]");

  optionsPage = new ExperienceOptionPage(page);
  await test.step("it should not show the pricing definition field", async () => {
    expect(await optionsPage.formSection.count()).toBe(4);
  });
});

test("validation should prevent saving when language field is true but no languages are selected", async ({ page }) => {
  // First set languages field(the one with "yes", "no" radio buttons) to true
  await optionsPage.findByTestId("input-radio-true").click();

  // Open languages dropdown and deselect all languages (dropdown)
  const trigger = page.getByTestId("option-languages-trigger");
  await trigger.click();
  await page.locator("#language-checkbox-en").click();
  await page.locator("#language-checkbox-fr").click();

  await page.click("body"); // click outside

  // Verify the dropdown has error state
  await expect(trigger).toHaveAttribute("aria-invalid", "true");
  await expect(trigger).toHaveClass(/border-error-100/); // this is for the future refactor of multiselect component

  // save draft button should be disabled
  expect(await page.getByTestId("document-action-bar-save-content").isDisabled()).toBe(true);
});
