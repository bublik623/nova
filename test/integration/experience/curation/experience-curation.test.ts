import { test, expect } from "@playwright/test";
import { ExperienceCurationPage } from "./experience-curation.fixture";
import mockApi from "./experience-curation.mocks";
let curationPage: ExperienceCurationPage;

test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/curation/settings");
  await page.waitForSelector(".DocumentLayout");

  curationPage = new ExperienceCurationPage(page);
});

test("Curation flow", async () => {
  await test.step("the master page should be rendered correctly", async () => {
    // check that the page wrapper is present
    expect(await curationPage.findByTestId("experience-curation-test-id").isVisible()).toBe(true);

    // check that the tabs are present
    expect(await curationPage.findByTestId("experience-curation-test-id-tabs").isVisible()).toBe(true);

    await test.step(" if the title field is empty the save buttons are disabled", async () => {
      await curationPage.titleInput.fill("");
      await curationPage.checkSaveButtonsAttribute("disabled", "");

      await curationPage.titleInput.fill("Hello!");
      await curationPage.checkSaveButtonsAttribute("disabled", null);
    });

    await test.step("the left nav bar should be rendered correctly", async () => {
      const experienceStatusBadge = curationPage.findByTestId("experience-status-badge");
      // check the status
      expect(await experienceStatusBadge.getAttribute("data-flow-code")).toContain("CURATION");
      expect(await experienceStatusBadge.getAttribute("data-status-code")).toContain("TO_BE_EDIT");

      expect(await curationPage.actionBar.isVisible()).toBeTruthy();

      expect(await curationPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");

      // check the visualization toggle
      await expect(curationPage.findByTestId("editorial-title-input-text")).toBeVisible();

      await expect(curationPage.findByTestId("raw-title-input-text-readonly")).toBeVisible();

      await curationPage.rawFieldsToggle.click();

      await expect(curationPage.findByTestId("raw-title-input-text-readonly")).not.toBeVisible();
      await expect(curationPage.findByTestId("raw-description")).not.toBeVisible();
      await expect(curationPage.findByTestId("raw-info-voucher")).not.toBeVisible();

      // check the navigation links match
      expect(await curationPage.page.locator('[data-testid^="sidebar-section-item-"]').count()).toBe(8);

      // check if the NatGeo section appear in the sidebar
      await curationPage.selectNatGeoBrand();
      await curationPage.findByTestId("input-radio-NAT_GEO_TOUR_LEVEL_PREMIUM").click();
      expect(await curationPage.page.locator('[data-testid^="sidebar-section-item-"]').count()).toBe(9);

      // check the navigation works correctly
      await curationPage.findByTestId("sidebar-section-item-title").click();
      await curationPage.page.waitForURL(/.*#title.*/); // /settings#title
    });

    await test.step("it should be able to navigate with the media tabs", async () => {
      // check that the curation/media tabs are present
      expect(await curationPage.findByTestId("nova-tabs-item").count()).toBe(6);
      await curationPage.saveDraftBtn.click();

      await curationPage.findByTestId("nova-tabs-item").nth(5).click();

      /**
       * it looks like to go to /media/visuals there are two distinct page changes:
       * - first to: /media
       * - then to: /media/visuals
       * in order to reduce the chance of timing-out it's better to wait for each change distinctly
       **/
      await curationPage.page.waitForURL("experience/test-id/media/visuals", { timeout: 3000 });

      /**
       * it looks like to go to /media/visuals there are two distinct page changes:
       * - first to: /media
       * - then to: /media/visuals
       * so the test needs to invoke goBack 2 times in order
       * to reach the experience/{id}/curation/settings route
       **/
      await curationPage.page.goBack();
      await expect(curationPage.page).toHaveURL("experience/test-id/media");

      await curationPage.page.goBack();
      await expect(curationPage.page).toHaveURL(/experience\/test-id\/curation\/settings/);
    });

    // if the instant confirmation is false
    // it should show the confirmation time section in the sidebar
    await curationPage.saveDraft();
    await curationPage.clickSidebarLink(`pricing_and_availability`);
    await curationPage.waitForSelector("text=experience.pricing.experience-type.title");
    await curationPage.findByTestId("input-radio-true").click();
    expect(await curationPage.findSectionItem("experience.pricing.confirmation-time.title").isVisible()).toBeFalsy();
    await curationPage.findByTestId("input-radio-false").click();
    await curationPage.waitForSelector("text=experience.pricing.cutoff-time.title");
    expect(await curationPage.findSectionItem("experience.pricing.confirmation-time.title").isVisible()).toBeTruthy();
    // if the experience type is open
    // it should not show the cut-off time
    expect(await curationPage.findSectionItem("experience.pricing.cutoff-time.title").isVisible()).toBeTruthy();
    await curationPage.findByTestId("radio-card-NO-CALENDAR-FIXED-END").click();
    await curationPage.findByTestId("modal-save-btn").click(); // accept the modal
    await curationPage.waitForSelector("text=experience.pricing.experience-type.NO-CALENDAR-FIXED-END.title");
    expect(await curationPage.findSectionItem("experience.pricing.cutoff-time.title").isVisible()).toBeFalsy();
  });
});

test("Curation right action bar", async () => {
  await test.step("the the publish and send to preview buttons are present", async () => {
    expect(await curationPage.findByTestId("experience-curation-test-id-action-bar-publish-update").isVisible()).toBe(
      true
    );

    expect(await curationPage.sendToPreviewBtn.isVisible()).toBe(true);
  });

  await test.step("the user can see and open the collection criteria modal", async () => {
    await curationPage.page.getByTestId("experience-curation-brand-collection-criteria").click();

    await expect(curationPage.page.getByTestId("modal")).toBeVisible();

    const exceptionalExperienceText = curationPage.page.getByText(
      "experience.collection-criteria.exceptional-experiencestest exceptional"
    );
    const bestValueGuaranteedText = curationPage.page.getByText(
      "experience.collection-criteria.best-value-guaranteedtest best value guaranteed"
    );
    const createdWithCareText = curationPage.page.getByText(
      "experience.collection-criteria.created-with-caretest created with care"
    );

    await expect(exceptionalExperienceText).toBeVisible();
    await expect(bestValueGuaranteedText).toBeVisible();
    await expect(createdWithCareText).toBeVisible();

    await curationPage.page.getByTestId("create-pickup-modal-close-btn").click();

    await expect(curationPage.page.getByTestId("modal")).not.toBeVisible();
  });

  await test.step("the user can navigate to the version history", async () => {
    await curationPage.page.getByTestId("document-action-bar-history-btn").click();
    await curationPage.page.getByTestId("product-history-toggle").click();
    await curationPage.page.getByText("experience.version-history.curated-content by").click();
  });
});

// This test is currently disabled due to its complexity.
// The function "checkSaveDraftButtons" involves several complex operations, including the "modifyDocument" function.
// To improve maintainability and test reliability, we need to refactor the test to be more explicit about its operations.
// Until this refactoring is done, we can keep this test skipped.
// This is the task for the refactoring: OFF-2373
test.skip("the save buttons should save correctly", async () => {
  const curationStoreUrls = [
    "http://localhost:8081/experience-translations/id-translation-en",
    "http://localhost:8086/experience-highlights/id-highlights",
    "http://localhost:8086/experience-included/id-included",
    "http://localhost:8086/experience-non-included/id-non-included",
    "http://localhost:8086/experience-important-information/id-important-info",
    "http://localhost:8086/experience-additional-services/id-additional-services",
    "http://localhost:8086/experience-categories/id-categories",
    "http://localhost:8086/experience-interests/id-categories",
    "http://localhost:8086/experience-markets/test-market",
    "http://localhost:8088/experiences/test-id",
  ];

  const bookingInfoPutUrl = "http://localhost:8086/experience-booking-information/12345";
  const locationInfoPutUrl = "http://localhost:8086/experience-location/test-id";

  // settings page
  await curationPage.countSidebarItems("settings", 9);
  await curationPage.checkSaveDraftButtons(curationStoreUrls, true, "location");

  // location page
  await curationPage.countSidebarItems("location", 3);
  await curationPage.checkSaveDraftButtons([...curationStoreUrls, locationInfoPutUrl], true, "content-generation");

  // content generation page
  await curationPage.countSidebarItems("content_generation", 10);
  await curationPage.checkSaveDraftButtons(curationStoreUrls, true, "customer-info");

  // customer info page
  await curationPage.countSidebarItems("customer_information", 3);
  await curationPage.checkSaveDraftButtons([...curationStoreUrls, bookingInfoPutUrl], true, "pricing-and-availability");

  // pricing and availability  page
  await curationPage.countSidebarItems("pricing_and_availability", 6);
  await curationPage.checkSaveDraftButtons(curationStoreUrls, true, "options");

  // options page
  await curationPage.countSidebarItems("options", 0);
  await curationPage.checkSaveDraftButtons([]);

  // if a call fail the user should not be redirected
  const settingsUrl = "experience/test-id/curation/settings";
  await curationPage.page.goto(settingsUrl);

  await curationPage.failRequest(curationStoreUrls[0], "PUT");
  await curationPage.saveDraftAndGoToNextSection("notifications.error.saving.document");
  expect(curationPage.page.url()).toContain(settingsUrl);
});
