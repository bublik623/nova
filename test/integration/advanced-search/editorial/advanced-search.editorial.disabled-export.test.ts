import { test, expect } from "@playwright/test";
import mockApi from "./advanced-search.editorial.mocks";
import { AdvancedSearchEditorialPage } from "./advanced-search.editorial.fixture";
import { mockRemoteFeatureFlag, waitForFeatureFlagsRefresh } from "../../utils/mockRemoteFeatureFlag";

test.describe("advanced search editorial page - disabled export", () => {
  let advancedSearchEditorialPage: AdvancedSearchEditorialPage;

  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await mockRemoteFeatureFlag(page, { editorial_adv_search_export_enabled: false });

    await page.goto("/advanced-search/editorial");

    await waitForFeatureFlagsRefresh(page);

    advancedSearchEditorialPage = new AdvancedSearchEditorialPage(page);
    await advancedSearchEditorialPage.waitForDataToLoad();
  });

  test("should not allow downloading the search results as excel file if the FF is disabled", async () => {
    const exportButton = advancedSearchEditorialPage.getExportButton();
    await expect(exportButton).not.toBeAttached();
  });
});
