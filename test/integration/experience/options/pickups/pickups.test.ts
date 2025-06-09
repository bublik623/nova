import { test, expect } from "@playwright/test";
import mockApi from "../experience-options.mocks";
import { testId } from "@/utils/test.utils";

test.beforeEach(async ({ page }) => {
  await mockApi(page);

  await page.goto("/experience/test-experience-id/options/raw/test-option-id/pickups");
  await page.waitForSelector(testId("input-radio-true"));
});

test("view form", async ({ page }) => {
  await test.step("view form - doesn't display fields when the pickup service is not enabled", async () => {
    await page.locator(testId("input-radio-false")).click();

    expect(await page.locator(testId("field-pickups-input")).isVisible()).toBe(false);
    expect(await page.locator(testId("input-phone-number")).isVisible()).toBe(false);
    expect(await page.locator(testId("email-input-text")).isVisible()).toBe(false);
  });

  await test.step("view form - displays fields when the pickup service is enabled", async () => {
    await page.locator(testId("input-radio-true")).click();

    expect(await page.locator(testId("field-pickups-input")).isVisible()).toBe(true);
    expect(await page.locator(testId("input-phone-number")).isVisible()).toBe(true);
    expect(await page.locator(testId("email-input-text")).isVisible()).toBe(true);
  });

  await test.step("displays the modal when new pickup button is clicked", async () => {
    await page.locator(testId("new-pickup-button")).click();

    expect(await page.locator(testId("modal-create-pickup")).isVisible()).toBe(true);
  });
});
