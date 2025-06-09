import { expect, Locator, Page } from "@playwright/test";
import { testId } from "@/utils/test.utils";

export const selectors = {
  ageRangeError: testId("holder-overlapping-age-error"),
  addPricing: "add-pricing",
  pricingNameInput: testId("pricing-name-input-text"),
  addHolder: testId("add-holder"),
  deleteHolder: testId("delete-holder"),
  savePricing: testId("save-all"),
  collapseTitle: testId("nova-collapse-title"),
  modalConfirm: testId("modal-save-btn"),
  retailPriceCurrencySymbol: testId("retail-price-currency-symbol"),
  collapseToggle: testId("collapsible-action-toggle"),
  // holder inputs
  holderItem: testId("holder-item"),
  holderSelect: testId("select-button"),
  holderSelectListItem: testId("options-list-list-item"),
  holderAgeFrom: testId("holder-age-from"),
  holderAgeTo: testId("holder-age-to"),
  holderAmountFrom: testId("holder-amount-from"),
  holderAmountTo: testId("holder-amount-to"),
  holderRetailPrice: testId("holder-retail-price"),
  holderNetPrice: testId("holder-net-price"),
};

export class ExperiencePricingPage {
  page: Page;

  pricingItems: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pricingItems = this.findByTestId("pricing-item");
  }

  findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}]`);
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  findByTestIdNth(index: number, testId: string) {
    const result = this.pricingItems.locator(`[data-testid=${testId}]`).nth(index);
    return result;
  }

  async checkField(index: number, selector: string, value?: string) {
    const field = this.pricingItems.locator(selector).nth(index);
    expect(await field.inputValue()).toBe(value);
  }

  getCollapseExpandToggle(pricingCard: Locator) {
    return pricingCard.locator(selectors.collapseToggle);
  }

  getPricingNameField(pricingCard: Locator) {
    return pricingCard.locator(selectors.pricingNameInput).first();
  }

  getPaxTypeCheckbox(pricingCard: Locator, paxType: string) {
    return pricingCard.locator(testId(`holder-${paxType}-pricing`)).locator("input[type='checkbox']");
  }

  getRetailPriceField(pricingCard: Locator, paxType: string) {
    return pricingCard.locator(testId(`retail-price-${paxType}-input-number`));
  }

  getCommissionPercentageField(pricingCard: Locator, paxType: string) {
    return pricingCard.locator(testId(`commission-${paxType}-input-number`));
  }

  getNetPriceField(pricingCard: Locator, paxType: string) {
    return pricingCard.locator(testId(`net-price-${paxType}-input-number`));
  }

  getSetPurchasableAmountButton(pricingCard: Locator, paxType: string) {
    return pricingCard.getByTestId(`add-purchasable-amount-${paxType}`);
  }

  getMinPurchasableQuantity(pricingCard: Locator, paxType: string) {
    return pricingCard.locator(testId(`purchasable-amount-min-${paxType}-input-number`));
  }

  getMaxPurchasableQuantity(pricingCard: Locator, paxType: string) {
    return pricingCard.locator(testId(`purchasable-amount-max-${paxType}-input-number`));
  }

  getSaveAndGoNextButton() {
    return this.page.getByTestId("go-to-next-route-button");
  }

  getSaveDraftButton() {
    return this.page.getByTestId("document-action-bar-save-content");
  }

  getCompleteOptionButton() {
    return this.page.getByTestId("document-action-bar-complete-option");
  }

  async typeField(index: number, selector: string, value: string) {
    const field = this.pricingItems.locator(selector).nth(index);
    await field.fill(value);
  }

  async selectHolderType(holderIndex: number, holderType: string) {
    await this.findByTestId("holder_type").nth(holderIndex).locator("button").click();

    await this.page.getByTestId(`options-list-list-item-${holderType.toLocaleLowerCase()}`).click();
  }

  pause() {
    return this.page.pause();
  }

  // wait for items to be visible on the page
  async waitForLoading() {
    await this.page.waitForSelector("[data-testid=pricing-name-input-text-container]");
  }

  async clickSetPurchasableAmount() {
    const button = this.findByTestId("button-purchasable").first();
    await button.click();
  }
}
