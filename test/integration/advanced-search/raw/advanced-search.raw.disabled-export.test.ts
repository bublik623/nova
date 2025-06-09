import { test, expect } from "@playwright/test";
import mockApi from "./advanced-search.raw.mocks";
import { AdvancedSearchRawPage } from "./advanced-search.raw.fixture";
import { mockRemoteFeatureFlag, waitForFeatureFlagsRefresh } from "../../utils/mockRemoteFeatureFlag";

test.describe("advanced search raw page - disabled export", () => {
  let advancedSearchRawPage: AdvancedSearchRawPage;

  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await mockRemoteFeatureFlag(page, { raw_adv_search_export_enabled: false });

    await page.goto("/advanced-search/raw");

    await waitForFeatureFlagsRefresh(page);

    advancedSearchRawPage = new AdvancedSearchRawPage(page);
    await advancedSearchRawPage.waitForDataToLoad();
  });

  test("should not allow downloading the search results as excel file if the FF is disabled", async () => {
    const exportButton = advancedSearchRawPage.getExportButton();
    await expect(exportButton).not.toBeAttached();
  });
});
