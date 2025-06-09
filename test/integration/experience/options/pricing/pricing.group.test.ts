import { test, expect } from "@playwright/test";
import { mockGroupPricingData, mockOptionData } from "./pricing.data";
import { ExperiencePricingPage } from "./pricing.fixture";
import mockApi, { pricingUrlGet, offerServiceURL } from "./pricing.mocks";

let pricingPage: ExperiencePricingPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page);

  const mockOfferOptionResponse = { ...mockOptionData, pricing_type_allowed: "group" };

  // override the base mockApi mocks
  await page.route(`${offerServiceURL}/options/test-option-id`, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 204,
        body: JSON.stringify(mockOfferOptionResponse),
      });
    } else {
      throw new Error("No mocked route!");
    }
  });

  await page.route(pricingUrlGet, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockGroupPricingData),
      });
    }
  });

  await page.goto("/experience/test-experience-id/options/raw/test-option-id/pricing");
  await page.waitForSelector("[data-testid=pricing-name-input-text]");

  pricingPage = new ExperiencePricingPage(page);
});

test("The group pricing should work correctly", async () => {
  const { page } = pricingPage;

  await test.step("The form should display correctly", async () => {
    await Promise.all([
      expect(
        page.getByRole("paragraph").filter({ hasText: "experience.availability.info.group.max-number" })
      ).toBeVisible(),
      expect(page.getByText("experience.holder.group.title").first()).toBeVisible(),
      expect(page.getByRole("paragraph").filter({ hasText: "experience.holder.group.description" })).toBeVisible(),
      expect(page.getByRole("button", { name: "+ experience.holder.add-holder.group" })).toBeVisible(),
      expect(page.getByTestId("holder-all-ages").locator(".checkbox-container__checkbox-checked")).toBeVisible(),
      expect(page.getByTestId("holder-age-from")).toBeDisabled(),
      expect(page.getByTestId("holder-age-to")).toBeDisabled(),
    ]);
  });
});
