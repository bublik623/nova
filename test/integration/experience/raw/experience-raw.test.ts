import { test, expect } from "@playwright/test";
import { mockRequest } from "../../utils/mockRequest";
import { exampleOwnOfferCode } from "../../utils/mockMasterData";
import mockApi, { experienceRawURL } from "./experience-raw.mocks";
import { ExperienceRawPage } from "./experience-raw.fixture";
import { testId, startsWithTestId } from "@/utils/test.utils";

const baseLink = "/experience/test-id/raw/settings";

let rawPage: ExperienceRawPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto(baseLink);
  await page.waitForSelector(testId("field-heading-title"));

  rawPage = new ExperienceRawPage(page);
});

test("the refcode should be displayed", async () => {
  expect(await rawPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");
});

test("the user should be able to see and navigate the selected experience", async ({ page }) => {
  // Check if the hash navigation work
  await rawPage.saveDraft();
  await rawPage.clickSidebarSection("settings");
  await rawPage.clickSidebarItem("title");
  await page.waitForSelector("text=experience-shared.save-and-go-to-next-section");
  await expect(page).toHaveURL("experience/test-id/raw/settings#title");

  // if the instant confirmation is false
  // it should show the confirmation time section in the sidebar
  await rawPage.clickSidebarLink(`pricing_and_availability`);
  await page.waitForSelector("text=experience.pricing.experience-type.title");
  await rawPage.findByTestId("input-radio-true").click();
  expect(await rawPage.findSectionItem("experience.pricing.confirmation-time.title").isVisible()).toBeFalsy();
  await rawPage.findByTestId("input-radio-false").click();
  await page.waitForSelector("text=experience.pricing.cutoff-time.title");
  expect(await rawPage.findSectionItem("experience.pricing.confirmation-time.title").isVisible()).toBeTruthy();
  // if the experience type is open
  // it should not show the cut-off time
  expect(await rawPage.findSectionItem("experience.pricing.cutoff-time.title").isVisible()).toBeTruthy();
  await rawPage.findByTestId("radio-card-NO-CALENDAR-FIXED-END").click();
  await rawPage.findByTestId("modal-save-btn").click(); // accept the modal

  await page.waitForSelector("text=experience.pricing.experience-type.NO-CALENDAR-FIXED-END.title");
  expect(await rawPage.findSectionItem("experience.pricing.cutoff-time.title").isVisible()).toBeFalsy();
});

test(`The user should be able to fill some fields and send to preview`, async ({ page }) => {
  const titlePatchRequest = page.waitForRequest(
    (request) => request.method() === "PATCH" && request.url().includes("mock-raw-id")
  );

  await mockRequest(page, `${experienceRawURL}/experience-raw/test-id`, "PUT");

  // When the user updates the title, the query should refresh and we need to respond with the "updated" title
  await page.route(`${experienceRawURL}/v2/experience-raw*`, async (route) => {
    const json = [
      {
        commercial: {
          title: "Hello World!",
        },
        id: "mock-raw-id",
        experience_id: "mock-experience-id",
      },
    ];
    await route.fulfill({ json });
  });

  await rawPage.titleInput.fill("");
  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(true);

  await rawPage.titleInput.fill("Hello World!");
  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(false);

  await Promise.all([rawPage.saveDraft(), titlePatchRequest]);

  await rawPage.clickSidebarSection("content_generation");
  expect(await rawPage.modalUnsavedChanges.isVisible()).toBe(false);
  await page.locator(startsWithTestId("options-list-list-item")).nth(0).click();

  await rawPage.saveDraft();
  await rawPage.clickSidebarSection("settings");

  await rawPage.page.getByTestId("experience-category-show-btn").click();
  await rawPage.page.getByRole("button", { name: "Activities" }).click();
  await rawPage.page.getByTestId("category-modal-next-btn").click();
  await rawPage.page.getByText("Air activities").click();
  await rawPage.page.getByTestId("category-modal-save-btn").click();

  expect(await rawPage.modalUnsavedChanges.isVisible()).toBe(false);
  await page.locator(testId(`input-radio-${exampleOwnOfferCode}`)).check();

  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(true);

  // if nat_geo_tour_levels exist is required
  await rawPage.checkNatGeoTourLevel();
  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(true);

  await rawPage.findByTestId("input-radio-NAT_GEO_TOUR_LEVEL_PREMIUM").click();
  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(true);
  await rawPage.findByTestId("input-radio-BRAND_SCENE").check();
  expect(await rawPage.sendToReviewButton.isDisabled()).toBe(true);

  await rawPage.page.getByText("TUI Designed & TUI Operated").click();

  // Wait for the send-to-review API call
  const sendToReviewRequest = page.waitForRequest(
    (request) => request.method() === "POST" && request.url().includes("/experience-raw/mock-raw-id/send-to-review")
  );

  // Open attribute modal
  await rawPage.sendToReviewButton.click();
  await rawPage.modalAttributeConfirmButton.click();

  // Verify the send-to-review API was called
  await expect(sendToReviewRequest).resolves.toBeTruthy();
  await rawPage.checkNotifications("notifications.success.saving.document");
});

test("Raw right action bar", async () => {
  await test.step("the user can navigate to the version history", async () => {
    await rawPage.page.getByTestId("document-action-bar-history-btn").click();
    await rawPage.page.getByTestId("product-history-toggle").click();
    await rawPage.page.getByTestId("document-action-bar-content").getByText("experience.flow_code.BASE").click();
  });
});
