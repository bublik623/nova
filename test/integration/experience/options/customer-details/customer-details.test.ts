import { test, expect } from "@playwright/test";
import mockApi from "../experience-options.mocks";
import { testId } from "@/utils/test.utils";

test.beforeEach(async ({ page }) => {
  await mockApi(page);

  await page.goto("/experience/test-experience-id/options/raw/test-option-id/customer-details");
  await page.waitForSelector("[data-testid^='category-']");
});

test("view form", async ({ page }) => {
  // 2 categories
  expect(await page.locator("[data-testid^='category-']").count()).toBe(2);
  // 4 questions
  expect(await page.locator(testId("question")).count()).toBe(4);
});
