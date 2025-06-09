import { test, expect } from "@playwright/test";
import { rawData, distributionContentData } from "./dashboard.data";
import { Dashboard } from "./dashboard.fixture";
import mockApi, { contentQueryURL } from "./dashboard.mocks";
import { ExperienceContentV2 } from "@/types/generated/ContentQueryApiV2";
import { integrationBaseURL } from "@/playwright.config";

let dashboard: Dashboard;
const rawItems = rawData;
const editorialItems = distributionContentData.map((item) => ({
  ...item.experience_content![0],
  reference_code: item.reference_code,
  experience_media: item.experience_media,
}));

const selectors = {
  sidebarExperiencesButton: "#sidebar-product-sidebar.experiences",
  tableItemRaw: "[data-testid='dashboard-table-item-raw']",
  tableItemEditorial: "[data-testid='dashboard-table-item-editorial']",
  headerTuiLogo: "[data-testid='header-tui-logo']",
};

test.beforeEach(async ({ page }) => {
  await mockApi(page);

  await page.goto("/");
  dashboard = new Dashboard(page);
  await page.waitForSelector(selectors.tableItemRaw);
});

function createTranslations(experiences: ExperienceContentV2[]) {
  const translations = experiences.filter((experience) => experience.language_code !== "en");
  return translations;
}

test("the user should be able to see all experiences", async ({ page }) => {
  // Check raw items
  expect(await dashboard.rawTableRows.count()).toBe(rawItems.length);
  for (let i = 0; i < rawItems.length; i++) {
    await dashboard.checkRawTableData(i, rawItems[i]);
  }

  await dashboard.toggleBtn.click();
  await page.waitForSelector(selectors.tableItemEditorial);

  // Check editorial items
  expect(await dashboard.editorialTableRows.count()).toBe(editorialItems.length);
  for (let i = 0; i < editorialItems.length; i++) {
    const masterFile = editorialItems[i];
    const translations = createTranslations(distributionContentData[i].experience_content!);

    await dashboard.checkEditorialTableData(i, masterFile, translations);
  }
});

test("the user should be able to search an experience by title and by id and sort them", async ({ page }) => {
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes(contentQueryURL) && url.includes("experience-raw-content")) {
      const filters = url.split("&filters=")[1];
      expect(filters).toBe(
        "commercial.title%3Dre%3D.*TestString.*,experience_id%3Dre%3D.*TestString.*,reference_code%3Dre%3D.*TestString.*"
      );
    }
  });

  await dashboard.searchByTitle("TestString");

  await dashboard.sortBy("title");
  await page.waitForURL("/?search=TestString&sortBy=title-asc");

  await dashboard.sortBy("title");
  await page.waitForURL("/?search=TestString&sortBy=title-desc");

  await dashboard.sortBy("reference_code");
  await page.waitForURL("/?search=TestString&sortBy=reference_code-asc");
});

test("the user should be able to delete a raw experience", async ({ page }) => {
  let requestMade = false;
  page.on("request", (req) => {
    if (req.url().includes("distribution-content") && req.method() === "DELETE") {
      requestMade = true;
    }
  });

  // Navigate to experience first to create the tab
  await dashboard.editExperienceRaw(1);
  await dashboard.clickTestID("header-tui-logo");
  expect(await dashboard.tabs.count()).toBe(1);

  // Delete an experience
  await dashboard.deleteExperience(1);
  expect(await dashboard.tabs.count()).toBe(0);

  expect(requestMade).toBe(true);
});

test("the user should be able to create a new raw experience", async () => {
  // Create new raw experience
  await dashboard.createNewExperience();
  expect(dashboard.url).toContain("/experience/new-experience-id/raw");
});

test("the user should be able to edit raw and editorial experiences", async () => {
  // Edit raw content
  await dashboard.editExperienceRaw(0);
  expect(dashboard.url).toContain(`/experience/${rawItems[0].experience_id}/raw`);

  await dashboard.navigateTo("/");
  await dashboard.toggleBtn.click();

  // Edit commercial content
  await dashboard.editExperienceEditorial(0);
  expect(dashboard.url).toContain(`/experience/${editorialItems[0].experience_id}/curation`);
});

test("the user should be able to edit a translation", async () => {
  await dashboard.toggleBtn.click();
  // Edit translation
  await dashboard.editExperienceTranslation(0, 2);
  expect(dashboard.url).toContain(`/experience/${editorialItems[0].experience_id}/translation/es`);
});

test.describe("Dashboard Routing", () => {
  test.describe("click on the return to dashboard buttons (tui logo and experience icon in the left sidebar)", () => {
    test.skip("should change `content` query param based on active document's content type", async ({ page }) => {
      // load an editorial content
      await page.goto(`/experience/${editorialItems[0].experience_id}/curation`);

      // click tui logo
      await page.waitForNavigation();
      await page.click(selectors.headerTuiLogo);
      expect(page.url()).toContain("content=editorial");

      // load a raw content
      await page.goto(`/experience/${rawItems[0].id}/raw`);

      // click tui logo
      await page.waitForNavigation();
      await page.click(selectors.headerTuiLogo);

      expect(page.url()).toContain("content=raw");
    });

    test("should clear all query parameters if there isn't an active document", async ({ page }) => {
      // open a page (other than experience-raw and experience-curation pages)
      await page.goto("/?content=editorial");
      await page.waitForSelector(selectors.tableItemEditorial);

      // click on one of the return the dashboard buttons
      await page.click(selectors.headerTuiLogo);
      await page.waitForSelector(selectors.tableItemRaw);

      // search params should be empty
      const url = new URL(page.url());
      expect(url.searchParams.toString()).toBe("");
    });
  });

  test("content type toggle button should change the `content` query param", async ({ page }) => {
    // raw to editorial
    await dashboard.toggleBtn.click();
    await page.waitForSelector(selectors.tableItemEditorial);
    expect(page.url()).toContain("content=editorial");

    // editorial to raw
    await dashboard.toggleBtn.click();
    await page.waitForSelector(selectors.tableItemRaw);
    expect(page.url()).toBe(integrationBaseURL + "/?content=raw");
  });
});
