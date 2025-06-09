import { test, expect } from "@playwright/test";
import mockApi from "./commercial-content.mocks";
import { CommercialContentPage } from "./commercial-content.fixture";

let commercialContentPage: CommercialContentPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/masterdata-management/commercial-content/highlights");
  commercialContentPage = new CommercialContentPage(p);
  await commercialContentPage.page.waitForSelector(".wrapper");
});

test("Commercial page: adding missing translation", async () => {
  await test.step("adding missing translation", async () => {
    const { page } = commercialContentPage;

    await commercialContentPage.findByTestId("nova-collapse-header").click();
    await commercialContentPage.findByTestId("premade-list-item-TRAAVOIDTHETRAFFIC-ZGHW04").click();
    await commercialContentPage.findByTestId("add-translation-button").click();
    await commercialContentPage.findByTestId("update-translation-input-input-text").click();
    await commercialContentPage.findByTestId("update-translation-input-input-text").fill("new italian translation");
    await commercialContentPage.findByTestId("dialog-footer-next").click();
    await page.getByRole("button", { name: "masterdata.commercial.add-translation.complete-btn" }).click();
    await page.getByText("new italian translation").click();

    await expect(page.getByText("new italian translation")).toHaveCount(1);
  });
});

test("Commercial page: creating a new category", async () => {
  await test.step("creating a new category", async () => {
    const { page } = commercialContentPage;
    await page.getByTestId("masterdata-management-sidebar-list-item-included").click();

    await page.getByTestId("typology-bar-add-new-button").click();
    await page.getByTestId(`options-list-list-item-click:createCategory`).click();
    await page.getByTestId("create-category-title-input-input-text").click();
    await page.getByTestId("create-category-title-input-input-text").fill("new category");
    await page.getByTestId("dialog-footer-next").click();
    await page.getByTestId("premade-item-input-0-input-text").click();
    await page.getByTestId("premade-item-input-0-input-text").fill("item 1");
    await page.getByTestId("add-item-button").click();
    await page.getByTestId("premade-item-input-1-input-text").click();
    await page.getByTestId("premade-item-input-1-input-text").fill("item 2");
    await page.getByRole("button", { name: "masterdata.commercial.add-items-category.complete" }).click();
  });
});

test("Commercial page: creating a new item", async () => {
  await test.step("creating a new item", async () => {
    const { page } = commercialContentPage;

    await page.getByTestId("typology-bar-add-new-button").click();
    await page.getByTestId("options-list-list-item-click:addBtn").click();
    await page.getByTestId("select-button").click();
    await page.getByTestId("options-list-list-item-TRANSPORTATION").click();
    await page.getByTestId("premade-item-input-0-input-text").click();
    await page.getByTestId("premade-item-input-0-input-text").fill("item 3");
    await page.getByTestId("add-item-button").click();
    await page.getByTestId("premade-item-input-1-input-text").click();
    await page.getByTestId("premade-item-input-1-input-text").fill("item 4");
    await page.getByTestId("save-form-button").click();
  });
});
