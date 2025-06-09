import { test, expect } from "@playwright/test";
import { mockRequest } from "../../../utils/mockRequest";
import mockApi, { experienceRawURL } from "../experience-raw.mocks";
import { rawContentProductTypeNova } from "../experience-raw.data";
import { ExperienceRawPage } from "../experience-raw.fixture";

let rawPage: ExperienceRawPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/raw/content-generation");
  await page.waitForSelector("[data-testid=description-textarea]");

  rawPage = new ExperienceRawPage(page);
});

test("the user should be able to view content generation fields of the experience", async () => {
  expect(await rawPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");

  // Check that the amount of fields matches
  expect(await rawPage.formSection.count()).toBe(8);

  // Check we display the right data
  await rawPage.checkTextEditor("description-textarea", rawContentProductTypeNova.commercial.description);
  await rawPage.checkTextEditor(
    "additional_description-textarea",
    rawContentProductTypeNova.commercial.additional_description
  );

  // Check the additional services display the correct data
  await rawPage.findByTestId("duration-button").click();
  expect(await rawPage.additionalServices.isVisible()).toBeFalsy();

  await rawPage.findByTestId("duration-button").click();
  expect(await rawPage.additionalServices.nth(0).isVisible()).toBeTruthy();

  const additionalServices = ["Up to 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", ">12 hours", "Overnight"];
  await rawPage.checkAdditionalServices(additionalServices);
});

test(`the user should be able to fill some fields and save`, async ({ page }) => {
  await mockRequest(page, `${experienceRawURL}/experience-raw/test-id`, "PUT");

  const descriptionTextarea = await page.locator(
    "[data-testid='description-textarea'] > [data-testid='nova-text-editor-tiptap-editor']"
  );
  await descriptionTextarea.click();
  await descriptionTextarea.focus();

  await rawPage.saveDraft();

  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(false);
});
