import { expect, test } from "@playwright/test";
import mockApi, { experienceRawURL } from "../raw/experience-raw.mocks";
import { ExperienceRawPage } from "../raw/experience-raw.fixture";
import { testId } from "@/utils/test.utils";

const baseLink = "/experience/test-id/raw/settings";

let rawPage: ExperienceRawPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto(baseLink);
  await page.waitForSelector(testId("field-heading-title"));

  rawPage = new ExperienceRawPage(page);
});

test("unsaved changes dialog behavior", async ({ page }) => {
  await test.step("change the title of an experience", async () => {
    // When the user updates the title, the query should refresh and we need to respond with the "updated" title
    await page.route(`${experienceRawURL}/v2/experience-raw*`, async (route) => {
      const json = [
        {
          commercial: {
            title: "a different title",
          },
          id: "mock-raw-id",
          experience_id: "mock-experience-id",
        },
      ];
      await route.fulfill({ json });
    });

    await rawPage.titleInput.fill("a different title");
  });

  await test.step("move to location section and save changes", async () => {
    await rawPage.page.locator(`[data-testid="sidebar-section-wrapper-location"]`).click();
    await rawPage.page.getByTestId("modal-save-btn").click();
    await expect(rawPage.page).toHaveURL(/\/location/);
  });

  await test.step("go back to the dashboard", async () => {
    await rawPage.page.getByTestId("header-tui-logo").click();
    await expect(rawPage.page).toHaveURL(/\?content=raw/);
  });
});
