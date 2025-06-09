import { test, expect } from "@playwright/test";
import { MaintenancePage } from "./maintenance.fixture";
import { mockRemoteFeatureFlag, waitForFeatureFlagsRefresh } from "../utils/mockRemoteFeatureFlag";

let maintenancePage: MaintenancePage;
test.beforeEach(async ({ page }) => {
  maintenancePage = new MaintenancePage(page);
});

test("the user should not see the maintenance page, when not in maintenance mode", async ({ page }) => {
  await page.goto("/");

  await expect(maintenancePage.getTitle()).not.toBeAttached();
});

test("the user should see the maintenance page, when in maintenance mode", async ({ page }) => {
  await mockRemoteFeatureFlag(page, { MAINTENANCE: true });

  await page.goto("/");
  await waitForFeatureFlagsRefresh(page);

  await expect(maintenancePage.getTitle()).toBeAttached();
});
