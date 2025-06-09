import test, { expect } from "@playwright/test";
import { mockApi, visualsURL } from "./media-revision.mocks";
import { testId } from "@/utils/test.utils";
import { mockCurationRevision } from "./media-revision.data";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("when opening a media revision", async ({ page }) => {
  await page.goto(visualsURL);

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

    await expect(refcode).toContainText(`experience.common.ref_code ${mockCurationRevision.reference_code}`);
    await expect(searchBar).toBeEditable();
    await expect(
      page.getByTestId("sidebar-section-wrapper-visuals").getByTestId("sidebar-section-title")
    ).toBeVisible();
    await expect(page.getByTestId("sidebar-section-item-gallery").getByText("experience.gallery.title")).toBeVisible();
  });
});

test("the settings page is rendered correctly", async ({ page }) => {
  await page.goto(visualsURL);

  await test.step("the data is shown", async () => {
    await expect(page.getByTestId("nova-image-preview-card-image")).toBeVisible();
  });

  await test.step("it does not have a go to next page button", async () => {
    await expect(page.getByTestId("go-to-next-route-button")).not.toBeVisible();
  });
});
