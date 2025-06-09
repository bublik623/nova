import test, { expect } from "@playwright/test";
import {
  contentSegmentationURL,
  customerInfoURL,
  locationURL,
  mockApi,
  settingsURL,
  asterixIntegrationURL,
} from "./raw-revision.mocks";
import { testId } from "@/utils/test.utils";
import { mockAsxModalities, mockAsxServices, mockDistributionData } from "./raw-revision.data";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("when opening a revision", async ({ page }) => {
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
      page.getByTestId("sidebar-section-item-supplier_name").getByText("experience.supplier_name.title")
    ).toBeVisible();
    await expect(
      page.getByTestId("sidebar-section-item-external_reference_code").getByText("experience.")
    ).toBeVisible();

    await expect(
      page.getByTestId("sidebar-section-item-categories").getByText("experience.categories.title")
    ).toBeVisible();
    await expect(page.getByTestId("sidebar-section-item-promotional_options").getByText("experience.")).toBeVisible();
    await expect(
      page.getByTestId("sidebar-section-item-product_brand").getByText("experience.product_brand.title")
    ).toBeVisible();
    await expect(
      page.getByTestId("sidebar-section-item-own_offer").getByText("experience.own_offer.title")
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
});

test("the settings page is rendered correctly", async ({ page }) => {
  await page.goto(settingsURL);

  await test.step("the data is shown", async () => {
    await expect(page.getByTestId("title-input-text-readonly").getByText("1805906d-b861-4380-bf6e-")).toBeVisible();
    await expect(page.getByText("experience.supplier_name.description")).toBeVisible();
    await expect(page.getByText("test ref code")).toBeVisible();
    await expect(page.getByText("Boat trips")).toBeVisible();
    await expect(page.getByTestId("radio-group-promotional_options.options-readonly")).toBeVisible();
    await expect(page.locator("#product_brand").getByText("experience.product_brand.title")).toBeVisible();
    await expect(page.getByTestId("radio-group-own_offer.options-readonly")).toBeVisible();
  });

  await test.step("it navigates correctly", async () => {
    await page.getByTestId("go-to-next-route-button").click();
    await page.waitForURL(locationURL);
  });
});

test("the location page is rendered correctly", async ({ page }) => {
  await page.goto(locationURL);

  await test.step("the data is shown", async () => {
    await expect(page.getByText("DubrovnikCroatia")).toBeVisible();
    await expect(page.getByText("Croatia, Brsečinska ulica,")).toBeVisible();
    await expect(page.getByText("Any Meeting point details")).toBeVisible();
  });

  await test.step("it navigates correctly", async () => {
    await page.getByTestId("go-to-next-route-button").click();
    await page.waitForURL(contentSegmentationURL);
  });
});

test("the content segmentation page is rendered correctly", async ({ page }) => {
  await page.goto(contentSegmentationURL);

  await test.step("the data is shown", async () => {
    await expect(page.getByTestId("editorial-description").getByText("Any description")).toBeVisible();
    await expect(page.getByText("Any Additional description")).toBeVisible();
    await expect(page.locator("#features").getByText("experience.features.title")).toBeVisible();
    await expect(page.getByText("Any custom highlights")).toBeVisible();
    await expect(page.getByText("Any custom included")).toBeVisible();
    await expect(page.getByText("Any custom non-included")).toBeVisible();
    await expect(page.getByText("Any custom important")).toBeVisible();
    await expect(page.locator("ul").filter({ hasText: "Up to 2 hours" })).toBeVisible();
  });

  await test.step("it navigates correctly", async () => {
    await page.getByTestId("go-to-next-route-button").click();
    await page.waitForURL(customerInfoURL);
  });
});

test("the customer info page is rendered correctly", async ({ page }) => {
  await page.goto(customerInfoURL);

  await test.step("the data is shown", async () => {
    await expect(page.getByText("+000699999999")).toBeVisible();
    await expect(page.getByTestId("voucher-type-field")).toBeVisible();
    await expect(page.getByText("Any Voucher instructions")).toBeVisible();
  });

  await test.step("it should have no go next button", async () => {
    await expect(page.getByTestId("go-to-next-route-button")).not.toBeVisible();
  });
});

test("the asterix integration page is rendered correctly", async ({ page }) => {
  await page.goto(asterixIntegrationURL);

  await test.step("the data is shown", async () => {
    await expect(page.getByTestId("service-and-modalities-field")).toBeAttached();
    await expect(page.getByTestId("selected-service-name")).toContainText(mockAsxServices[0].default_name!);
    await expect(page.getByTestId("selected-modality-name")).toContainText(
      `${mockAsxModalities[0].code} - ${mockAsxModalities[0].default_name}`
    );
  });
});
