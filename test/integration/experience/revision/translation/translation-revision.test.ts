import test, { expect } from "@playwright/test";
import {
  asterixIntegrationURL,
  contentSegmentationURL,
  customerInfoURL,
  locationURL,
  mockApi,
  settingsURL,
} from "./translation-revision.mocks";
import { testId } from "@/utils/test.utils";
import {
  mockDistributionData,
  mockASXTranslationRevision,
  mockASXMasterLanguageRevision,
} from "./translation-revision.data";
import { integrationBaseURL } from "@/playwright.config";

test.describe("common translation revision", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, "NOVA");
  });

  test("when opening a translation revision", async ({ page }) => {
    await page.goto(settingsURL);

    await test.step("it renders the common components", async () => {
      await expect(page.getByTestId("nova-alert")).not.toBeVisible();
      await expect(
        page.getByTestId("document-action-bar-history").locator("div").filter({ hasText: "product-history.toggle." })
      ).toBeVisible();
    });

    await test.step("it renders the navigation correctly", async () => {
      const sidebarWrapper = page.locator(testId("sidebar-wrapper"));
      const refcode = sidebarWrapper.locator("div").filter({ hasText: "experience.common.ref_code" }).nth(1);
      const searchBar = page.getByTestId("list-search-input-text");

      await expect(refcode).toContainText(`experience.common.ref_code ${mockDistributionData.reference_code}`);
      await expect(searchBar).toBeEditable();
      await expect(
        page.getByTestId("sidebar-section-wrapper-settings").getByTestId("sidebar-section-title")
      ).toBeVisible();
      await expect(page.getByTestId("sidebar-section-item-title").getByText("experience.title.title")).toBeVisible();

      await expect(
        page.getByTestId("sidebar-section-item-seo_title").getByText("experience.seo_title.title")
      ).toBeVisible();
      // closed sections
      await expect(
        page.getByTestId("sidebar-section-wrapper-location").getByTestId("sidebar-section-title")
      ).toBeVisible();
      await expect(
        page.getByTestId("sidebar-section-wrapper-content-segmentation").getByTestId("sidebar-section-title")
      ).toBeVisible();
      await expect(
        page.getByTestId("sidebar-section-wrapper-customer-info").getByTestId("sidebar-section-title")
      ).toBeVisible();
    });

    await test.step("it can navigate to other revisions correctly", async () => {
      await page.getByTestId("product-history-toggle").click();
      await page.getByTestId("version-card-action-view").nth(1).click();

      await expect(page).toHaveURL(
        `${integrationBaseURL}/experience/$expId/revision/test-id-es-1/translation/es/settings`
      );
    });
  });

  test("the settings page is rendered correctly", async ({ page }) => {
    const curationTitle = page
      .getByTestId("editorial-title-input-input-text-readonly")
      .getByText("1805906d-b861-4380-bf6e-");
    const translationTitle = page
      .getByTestId("translation-title-input-input-text-readonly")
      .getByText("1805906d-b861-4380-bf6e-");

    const curationMetaTitle = page.getByText("Seo meta title test");
    const translationMetaTitle = page.getByText("Prueba de metatítulos SEO");

    await page.goto(settingsURL);

    await test.step("the data is shown", async () => {
      await expect(curationTitle).toBeVisible();
      await expect(translationTitle).toBeVisible();

      await expect(curationMetaTitle).toBeVisible();
      await expect(translationMetaTitle).toBeVisible();
    });

    await test.step("it navigates correctly", async () => {
      await page.getByTestId("go-to-next-route-button").click();
      await page.waitForURL(locationURL);
    });
  });

  test("the location page is rendered correctly", async ({ page }) => {
    const curationMeetingPointDetails = page.getByText("Any Meeting point details");
    const translationMeetingPointDetails = page.getByText("Cualquier detalle del punto de encuentro");

    await page.goto(locationURL);

    await test.step("the data is shown", async () => {
      await expect(curationMeetingPointDetails).toBeVisible();
      await expect(translationMeetingPointDetails).toBeVisible();
    });

    await test.step("it navigates correctly", async () => {
      await page.getByTestId("go-to-next-route-button").click();
      await page.waitForURL(contentSegmentationURL);
    });
  });

  test("the content segmentation page is rendered correctly", async ({ page }) => {
    const curationDescription = page.getByText("Any description", {
      exact: true,
    });
    const translationDescription = page.getByText("Cualquier descripción", {
      exact: true,
    });
    const curationSeoDescription = page.getByText("Any description seo");
    const translationSeoDescription = page.getByText("Cualquier descripción SEO");
    const curationAdditionalDescription = page.getByText("Any Additional description");
    const translationAdditionalDescription = page.getByText("Cualquier descripción adicional");
    const curationCustomHighlights = page.getByText("Any custom highlights");
    const translationCustomHighlights = page.getByText("Cualquier costumbre incluida");
    const curationCustomIncluded = page.getByText("Any custom included");
    const translationCustomIncluded = page.getByText("Cualquier costumbre incluida");
    const curationCustomNonIncluded = page.getByText("Any custom non-included");
    const translationCustomNonIncluded = page.getByText("Cualquier costumbre no incluida");
    const curationCustomImportant = page.getByText("Any custom important information");
    const translationCustomImportant = page.getByText("Cualquier información");

    await page.goto(contentSegmentationURL);

    await test.step("the data is shown", async () => {
      await expect(curationDescription).toBeVisible();
      await expect(translationDescription).toBeVisible();
      await expect(curationSeoDescription).toBeVisible();
      await expect(translationSeoDescription).toBeVisible();
      await expect(curationAdditionalDescription).toBeVisible();
      await expect(translationAdditionalDescription).toBeVisible();
      await expect(curationCustomHighlights).toBeVisible();
      await expect(translationCustomHighlights).toBeVisible();
      await expect(curationCustomIncluded).toBeVisible();
      await expect(translationCustomIncluded).toBeVisible();
      await expect(curationCustomNonIncluded).toBeVisible();
      await expect(translationCustomNonIncluded).toBeVisible();
      await expect(curationCustomImportant).toBeVisible();
      await expect(translationCustomImportant).toBeVisible();
    });

    await test.step("it navigates correctly", async () => {
      await page.getByTestId("go-to-next-route-button").click();
      await page.waitForURL(customerInfoURL);
    });
  });

  test("the customer info page is rendered correctly", async ({ page }) => {
    const curationVoucherType = page.getByText("Any Voucher instructions");
    const translationVoucherType = page.getByText("Cualquier instrucción del cup");

    await page.goto(customerInfoURL);

    await test.step("the data is shown", async () => {
      await expect(curationVoucherType).toBeVisible();
      await expect(translationVoucherType).toBeVisible();
    });

    await test.step("it should have no go next button", async () => {
      await expect(page.getByTestId("go-to-next-route-button")).not.toBeVisible();
    });
  });
});

test.describe("ASX specific translation revision", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, "ASX");
  });

  test("the asterix integration page is rendered correctly", async ({ page }) => {
    await page.goto(asterixIntegrationURL);

    await expect(page.getByTestId("nova-experience-revision-$revisionId")).toBeAttached();

    const titleEditor = page.getByTestId("service-and-modalities-title-editor");
    await expect(titleEditor).toBeAttached();

    const serviceTitleEditor = titleEditor.getByTestId("service-title-editor-SVC-1");
    const serviceCuratedTitleValue = serviceTitleEditor.getByTestId("reference-value");
    const serviceTranslatedTitleValue = serviceTitleEditor.getByTestId("service-SVC-1-input-text-readonly");

    const modalityTitleEditor = titleEditor.getByTestId("modality-title-editor-MOD-1");
    const modalityCuratedTitleValue = modalityTitleEditor.getByTestId("reference-value");
    const modalityTranslatedTitleValue = modalityTitleEditor.getByTestId("modality-MOD-1-input-text-readonly");

    await Promise.all([
      expect(serviceCuratedTitleValue).toContainText(
        mockASXMasterLanguageRevision.experience_commercial_information.translations[0].asx_service_code_translations[0]
          .name
      ),
      // SVC-1 name spanish translation
      expect(serviceTranslatedTitleValue).toContainText(
        mockASXTranslationRevision.experience_commercial_information.translations[0].asx_service_code_translations[0]
          .name
      ),
      expect(modalityCuratedTitleValue).toContainText(
        mockASXMasterLanguageRevision.experience_commercial_information.translations[0].option_translations[0].name
      ),
      expect(modalityTranslatedTitleValue).toContainText(
        mockASXTranslationRevision.experience_commercial_information.translations[0].option_translations[0].name
      ),
    ]);

    await test.step("it should have no go next button", async () => {
      await expect(page.getByTestId("go-to-next-route-button")).not.toBeVisible();
    });
  });
});
