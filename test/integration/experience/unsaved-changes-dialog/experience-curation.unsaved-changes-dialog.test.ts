import { expect, test } from "@playwright/test";
import mockApi from "../curation/experience-curation.mocks";
import { ExperienceCurationPage } from "../curation/experience-curation.fixture";
import { ExperienceLocationPage } from "../curation/location/location.fixture.js";
import { testId } from "@/utils/test.utils";

test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");
});

test.describe("unsaved changes dialog behavior", () => {
  test.describe("settings page", () => {
    const settingsPagePath = "/experience/test-id/curation/settings";
    let curationPage: ExperienceCurationPage;

    test.beforeEach(async ({ page }) => {
      await page.goto(settingsPagePath);
      await page.waitForSelector(testId("field-heading-title"));
      curationPage = new ExperienceCurationPage(page);
    });

    test("unsaved changes dialog appears when there are unsaved changes", async () => {
      await test.step("change the title of an experience", async () => {
        await curationPage.titleInput.fill("a different title");
      });

      await test.step("move to location section and save changes", async () => {
        await curationPage.page.locator(`[data-testid="sidebar-section-wrapper-location"]`).click();
        await curationPage.page.getByTestId("modal-save-btn").click();
        await expect(curationPage.page).toHaveURL(/\/location/);
      });

      await test.step("go back to the dashboard", async () => {
        await curationPage.page.getByTestId("header-tui-logo").click();
        await expect(curationPage.page).toHaveURL(/\?content=editorial/);
      });
    });
    test("unsaved changes dialog does not appear when there are no unsaved changes", async () => {
      await test.step("move to location section", async () => {
        await curationPage.page.locator(`[data-testid="sidebar-section-wrapper-location"]`).click();
        await expect(curationPage.page).toHaveURL(/\/location/);
      });
    });
  });

  test.describe("location page", () => {
    const locationPagePath = "/experience/test-id/curation/location";
    let locationPage: ExperienceLocationPage;

    test.beforeEach(async ({ page }) => {
      await page.goto(locationPagePath);
      await page.waitForSelector(testId("field-heading-title"));
      locationPage = new ExperienceLocationPage(page);
    });

    test("unsaved changes dialog appears when there are unsaved changes", async () => {
      await test.step("clear selected city", async () => {
        await locationPage.findFieldCity().clear();
      });

      await test.step("move to content segmentation section and save changes", async () => {
        await locationPage.page.locator(`[data-testid="sidebar-section-wrapper-content_generation"]`).click();
        await locationPage.page.getByTestId("modal-save-btn").click();
        await expect(locationPage.page).toHaveURL(/\/content-generation/);
      });

      await test.step("go back to the dashboard", async () => {
        await locationPage.page.getByTestId("header-tui-logo").click();
        await expect(locationPage.page).toHaveURL(/\?content=editorial/);
      });
    });
    test("unsaved changes dialog does not appear when there are no unsaved changes", async () => {
      await test.step("move to content segmentation section", async () => {
        await locationPage.page.locator(`[data-testid="sidebar-section-wrapper-content_generation"]`).click();
        await expect(locationPage.page).toHaveURL(/\/content-generation/);
      });
    });
  });

  test.describe("content segmentation page", () => {
    const contentSegmentationPagePath = "/experience/test-id/curation/content-generation";

    test.beforeEach(async ({ page }) => {
      await page.goto(contentSegmentationPagePath);
    });

    test("unsaved changes dialog appears when there are unsaved changes", async ({ page }) => {
      await test.step("toggle a checkbox value", async () => {
        const firstCheckbox = page.locator("#features").locator("input[type=checkbox]").first();
        await firstCheckbox.click();
      });

      await test.step("move to customer information section and save changes", async () => {
        await page.locator(`[data-testid="sidebar-section-wrapper-customer_information"]`).click();
        await page.getByTestId("modal-save-btn").click();
        await expect(page).toHaveURL(/\/customer-info/);
      });

      await test.step("go back to the dashboard", async () => {
        await page.getByTestId("header-tui-logo").click();
        await expect(page).toHaveURL(/\?content=editorial/);
      });
    });
    test("unsaved changes dialog does not appear when there are no unsaved changes", async ({ page }) => {
      await test.step("move to customer information section", async () => {
        await page.locator(`[data-testid="sidebar-section-wrapper-customer_information"]`).click();
        await expect(page).toHaveURL(/\/customer-info/);
      });
    });
  });

  test.describe("customer information page", () => {
    const customerInformationPagePath = "/experience/test-id/curation/customer-info";

    test.beforeEach(async ({ page }) => {
      await page.goto(customerInformationPagePath);
      await page.waitForSelector("#emergency_contact");
    });

    test("unsaved changes dialog appears when there are unsaved changes", async ({ page }) => {
      await test.step("toggle a checkbox value", async () => {
        const phoneNumberInput = page.getByTestId("input-phone-number");
        await phoneNumberInput.fill("394924");
      });

      await test.step("move to pricing and availability section and save changes", async () => {
        await page.locator(`[data-testid="sidebar-section-wrapper-pricing_and_availability"]`).click();
        await page.getByTestId("modal-save-btn").click();
        await expect(page).toHaveURL(/\/pricing-and-availability/);
      });

      await test.step("go back to the dashboard", async () => {
        await page.getByTestId("header-tui-logo").click();
        await expect(page).toHaveURL(/\?content=editorial/);
      });
    });
    test("unsaved changes dialog does not appear when there are no unsaved changes", async ({ page }) => {
      await test.step("move to pricing and availability section", async () => {
        await page.locator(`[data-testid="sidebar-section-wrapper-pricing_and_availability"]`).click();
        await expect(page).toHaveURL(/\/pricing-and-availability/);
      });
    });
  });

  test.describe("pricing and availability page", () => {
    const pricingAndAvailabilityPagePath = "/experience/test-id/curation/pricing-and-availability";

    test.beforeEach(async ({ page }) => {
      await page.goto(pricingAndAvailabilityPagePath);
    });

    test("unsaved changes dialog appears when there are unsaved changes", async ({ page }) => {
      await test.step("edit information", async () => {
        const confirmationTimeDaysInput = page
          .locator("#pricing\\.confirmation-time")
          .locator("input[type=number]")
          .first();
        await confirmationTimeDaysInput.fill("3");
      });

      await test.step("move to options section and save changes", async () => {
        await page.locator(`[data-testid="sidebar-section-wrapper-options"]`).click();
        await page.getByTestId("modal-save-btn").click();
        await expect(page).toHaveURL(/\/options/);
      });

      await test.step("go back to the dashboard", async () => {
        await page.getByTestId("header-tui-logo").click();
        await expect(page).toHaveURL(/\?content=editorial/);
      });
    });
    test("unsaved changes dialog does not appear when there are no unsaved changes", async ({ page }) => {
      await test.step("move to options section", async () => {
        await page.locator(`[data-testid="sidebar-section-wrapper-options"]`).click();
        await expect(page).toHaveURL(/\/options/);
      });
    });
  });
});
