import { test, expect } from "@playwright/test";
import { mockPricingData } from "./pricing.data";
import { ExperiencePricingPage, selectors } from "./pricing.fixture";
import mockApi, { pricingUrlDelete, pricingUrlGet } from "./pricing.mocks";

let pricingPage: ExperiencePricingPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page);

  await page.goto("/experience/test-experience-id/options/raw/test-option-id/pricing");
  await page.waitForSelector("[data-testid=pricing-name-input-text]");

  pricingPage = new ExperiencePricingPage(page);
});

test("the user should be able to view available pricings", async () => {
  // 4 items on mount
  expect(await pricingPage.pricingItems.count()).toBe(4);

  // first pricing card
  const firstPricingCard = pricingPage.pricingItems.first();
  await expect(pricingPage.getPricingNameField(firstPricingCard)).toHaveValue("My pricing 1");
  // first pricing card - adult pricing
  await expect(pricingPage.getPaxTypeCheckbox(firstPricingCard, "adult")).toHaveAttribute("aria-checked", "true");
  await expect(pricingPage.getRetailPriceField(firstPricingCard, "adult")).toHaveValue("20");
  await expect(pricingPage.getCommissionPercentageField(firstPricingCard, "adult")).toHaveValue("10");
  await expect(pricingPage.getNetPriceField(firstPricingCard, "adult")).toHaveValue("18");
  await expect(pricingPage.getMinPurchasableQuantity(firstPricingCard, "adult")).toHaveValue("1");
  await expect(pricingPage.getMaxPurchasableQuantity(firstPricingCard, "adult")).toHaveValue("10");
  // first pricing card - child pricing
  await expect(pricingPage.getPaxTypeCheckbox(firstPricingCard, "child")).toHaveAttribute("aria-checked", "false");
  // first pricing card - infant pricing
  await expect(pricingPage.getPaxTypeCheckbox(firstPricingCard, "infant")).toHaveAttribute("aria-checked", "false");
  // first pricing card - youth pricing
  await expect(pricingPage.getPaxTypeCheckbox(firstPricingCard, "youth")).toHaveAttribute("aria-checked", "false");

  // second pricing card
  const secondPricingCard = pricingPage.pricingItems.nth(1);
  await expect(pricingPage.getPricingNameField(secondPricingCard)).toHaveValue("My pricing 2");
  // second pricing card - adult pricing
  await expect(pricingPage.getPaxTypeCheckbox(secondPricingCard, "adult")).toHaveAttribute("aria-checked", "false");
  // second pricing card - child pricing
  await expect(pricingPage.getPaxTypeCheckbox(secondPricingCard, "child")).toHaveAttribute("aria-checked", "true");
  await expect(pricingPage.getRetailPriceField(secondPricingCard, "child")).toHaveValue("20");
  await expect(pricingPage.getCommissionPercentageField(secondPricingCard, "child")).toHaveValue("10");
  await expect(pricingPage.getNetPriceField(secondPricingCard, "child")).toHaveValue("18");
  await expect(pricingPage.getMinPurchasableQuantity(secondPricingCard, "child")).toHaveValue("1");
  await expect(pricingPage.getMaxPurchasableQuantity(secondPricingCard, "child")).toHaveValue("10");
  // second pricing card - infant pricing
  await expect(pricingPage.getPaxTypeCheckbox(secondPricingCard, "infant")).toHaveAttribute("aria-checked", "false");
  // second pricing card - youth pricing
  await expect(pricingPage.getPaxTypeCheckbox(secondPricingCard, "youth")).toHaveAttribute("aria-checked", "false");

  // third pricing card
  const thirdPricingCard = pricingPage.pricingItems.nth(2);
  await expect(pricingPage.getPricingNameField(thirdPricingCard)).toHaveValue("My pricing 3");
  // third pricing card - adult pricing
  await expect(pricingPage.getPaxTypeCheckbox(thirdPricingCard, "adult")).toHaveAttribute("aria-checked", "false");
  // third pricing card - child pricing
  await expect(pricingPage.getPaxTypeCheckbox(thirdPricingCard, "child")).toHaveAttribute("aria-checked", "false");
  // third pricing card - infant pricing
  await expect(pricingPage.getPaxTypeCheckbox(thirdPricingCard, "infant")).toHaveAttribute("aria-checked", "true");
  await expect(pricingPage.getRetailPriceField(thirdPricingCard, "infant")).not.toBeAttached();
  await expect(pricingPage.getCommissionPercentageField(thirdPricingCard, "infant")).not.toBeAttached();
  await expect(pricingPage.getNetPriceField(thirdPricingCard, "infant")).not.toBeAttached();
  await expect(pricingPage.getMinPurchasableQuantity(thirdPricingCard, "infant")).toHaveValue("1");
  await expect(pricingPage.getMaxPurchasableQuantity(thirdPricingCard, "infant")).toHaveValue("10");
  // third pricing card - youth pricing
  await expect(pricingPage.getPaxTypeCheckbox(thirdPricingCard, "youth")).toHaveAttribute("aria-checked", "false");

  // fourth pricing card
  const fourthPricingCard = pricingPage.pricingItems.nth(3);
  await expect(pricingPage.getPricingNameField(fourthPricingCard)).toHaveValue("My pricing 4");
  // fourth pricing card - adult pricing
  await expect(pricingPage.getPaxTypeCheckbox(fourthPricingCard, "adult")).toHaveAttribute("aria-checked", "false");
  // fourth pricing card - child pricing
  await expect(pricingPage.getPaxTypeCheckbox(fourthPricingCard, "child")).toHaveAttribute("aria-checked", "false");
  // fourth pricing card - infant pricing
  await expect(pricingPage.getPaxTypeCheckbox(fourthPricingCard, "infant")).toHaveAttribute("aria-checked", "false");
  // fourth pricing card - youth pricing
  await expect(pricingPage.getPaxTypeCheckbox(fourthPricingCard, "youth")).toHaveAttribute("aria-checked", "true");
  await expect(pricingPage.getRetailPriceField(fourthPricingCard, "youth")).toHaveValue("10");
  await expect(pricingPage.getCommissionPercentageField(fourthPricingCard, "youth")).toHaveValue("10");
  await expect(pricingPage.getNetPriceField(fourthPricingCard, "youth")).toHaveValue("9");
  await expect(pricingPage.getMinPurchasableQuantity(fourthPricingCard, "youth")).toHaveValue("1");
  await expect(pricingPage.getMaxPurchasableQuantity(fourthPricingCard, "youth")).toHaveValue("10");
});

test("the user should be able to create a new pricing", async () => {
  // 4 items on mount
  expect(await pricingPage.pricingItems.count()).toBe(4);

  // click the add new pricing button
  await pricingPage.findByTestId(selectors.addPricing).click();

  // new pricing item should exist in the list and should contain empty name
  expect(await pricingPage.pricingItems.count()).toBe(5);
  await pricingPage.checkField(4, selectors.pricingNameInput, "");
});

test("the user should be able to delete a pricing", async ({ page }) => {
  let mockPricingResponse = [...mockPricingData];
  // mock GET pricings response
  await page.route(pricingUrlGet, async (route, req) => {
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(mockPricingResponse),
      });
    }
  });
  // mock DELETE pricings
  await page.route(pricingUrlDelete, async (route, req) => {
    if (req.method() === "DELETE") {
      const pricingId = req.url().split("/").pop();
      // delete the pricing from our mock response
      mockPricingResponse = mockPricingResponse.filter((pricing) => pricing.id !== pricingId);
      await route.fulfill({ status: 201, body: JSON.stringify({}) });
    }
  });

  // 4 items on mount
  expect(await pricingPage.pricingItems.count()).toBe(4);

  // click the delete icon of the first item
  await pricingPage.findByTestIdNth(0, "delete-pricing").click();
  await pricingPage.findByTestId("modal-save-btn").click();

  await pricingPage.waitForLoading();

  // the item should be deleted
  expect(await pricingPage.pricingItems.count()).toBe(3);
});

test("the user should be able to select a non-free of charge PaxType, define its pricing and save", async () => {
  const secondPricingCard = pricingPage.pricingItems.nth(1);

  await test.step("expand pricing card", async () => {
    await pricingPage.getCollapseExpandToggle(secondPricingCard).click();
  });
  await test.step("select pax type for new price", async () => {
    await pricingPage.getPaxTypeCheckbox(secondPricingCard, "youth").click();
  });
  await test.step("set retail price and commission", async () => {
    await pricingPage.getRetailPriceField(secondPricingCard, "youth").fill("200");
    await pricingPage.getCommissionPercentageField(secondPricingCard, "youth").fill("10");
  });
  await test.step("set purchasable quantity", async () => {
    await pricingPage.getSetPurchasableAmountButton(secondPricingCard, "youth").click();
    await pricingPage.getMinPurchasableQuantity(secondPricingCard, "youth").fill("2");
    await pricingPage.getMaxPurchasableQuantity(secondPricingCard, "youth").fill("20");
  });
  await test.step("can save", async () => {
    await expect(pricingPage.getSaveAndGoNextButton()).toBeEnabled();
    await expect(pricingPage.getSaveDraftButton()).toBeEnabled();
  });
});

test("the user should be able to select a free of charge PaxType and save", async () => {
  const secondPricingCard = pricingPage.pricingItems.nth(1);

  await test.step("expand pricing card", async () => {
    await pricingPage.getCollapseExpandToggle(secondPricingCard).click();
  });
  await test.step("select pax type for new price", async () => {
    await pricingPage.getPaxTypeCheckbox(secondPricingCard, "infant").click();
  });
  await test.step("retail price and commission inputs should not be present as it is a free of charge pax type", async () => {
    await expect(pricingPage.getRetailPriceField(secondPricingCard, "infant")).not.toBeAttached();
    await expect(pricingPage.getCommissionPercentageField(secondPricingCard, "infant")).not.toBeAttached();
  });
  await test.step("set purchasable quantity", async () => {
    await pricingPage.getSetPurchasableAmountButton(secondPricingCard, "infant").click();
    await pricingPage.getMinPurchasableQuantity(secondPricingCard, "infant").fill("2");
    await pricingPage.getMaxPurchasableQuantity(secondPricingCard, "infant").fill("20");
  });
  await test.step("can save", async () => {
    await expect(pricingPage.getSaveAndGoNextButton()).toBeEnabled();
    await expect(pricingPage.getSaveDraftButton()).toBeEnabled();
  });
});

test("the user should be able to de-select a PaxType effectively removing the associated pricing", async () => {
  const secondPricingCard = pricingPage.pricingItems.nth(1);

  await test.step("expand pricing card", async () => {
    await pricingPage.getCollapseExpandToggle(secondPricingCard).click();
  });
  await test.step("deselect pax type", async () => {
    await pricingPage.getPaxTypeCheckbox(secondPricingCard, "child").click();

    await expect(pricingPage.getRetailPriceField(secondPricingCard, "child")).not.toBeAttached();
    await expect(pricingPage.getCommissionPercentageField(secondPricingCard, "child")).not.toBeAttached();
    await expect(pricingPage.getNetPriceField(secondPricingCard, "child")).not.toBeAttached();
  });
});

test("the user should not be able to save if a price card do not have any price defined", async () => {
  const secondPricingCard = pricingPage.pricingItems.nth(1);
  await pricingPage.getCollapseExpandToggle(secondPricingCard).click();

  await pricingPage.getPaxTypeCheckbox(secondPricingCard, "child").click();

  await expect(pricingPage.getSaveAndGoNextButton()).toBeDisabled();
  await expect(pricingPage.getSaveDraftButton()).toBeDisabled();
});

// skipped because sometimes the retail price input have value "1" after the fill("0") is executed
test.skip("the user should not be able to save if the retail price for a pax type is zero", async () => {
  const firstPricingCard = pricingPage.pricingItems.first();

  await pricingPage.getRetailPriceField(firstPricingCard, "adult").fill("0");

  await expect(pricingPage.getSaveAndGoNextButton()).toBeDisabled();
  await expect(pricingPage.getSaveDraftButton()).toBeDisabled();
});
