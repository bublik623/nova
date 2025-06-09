import { Locator, Page, expect } from "@playwright/test";
import { ExperienceCurationPage } from "../experience-curation.fixture";

export class ExperienceCurationPricingAndAvailabilityPage extends ExperienceCurationPage {
  policiesModal: Locator;
  policiesItem: Locator;
  policiesItemReadonly: Locator;

  constructor(page: Page) {
    super(page);

    this.policiesModal = this.page.getByTestId("cancellation-policies-modal");
    this.policiesItem = this.page.getByTestId("cancellation-policies-item");
    this.policiesItemReadonly = this.page.getByTestId("cancellation-policies-item-readonly");
  }

  async editCancellationPolicy(index: number, time?: number, period?: "hours" | "days", amount?: number) {
    const policy = this.policiesItem.nth(index);

    if (time) {
      await policy.getByTestId("cancellation-policies-time-input").fill(time.toString());
    }

    if (period) {
      await policy.getByTestId("cancellation-policies-select").click();
      await this.page.getByTestId(`options-list-list-item-${period.toLocaleUpperCase()}`).click();
    }

    if (amount) {
      await policy.getByTestId("cancellation-policies-amount-input").fill(amount.toString());
    }
  }

  async checkCancellationPolicy(index: number, time: number, period: "hours" | "days", amount: number) {
    const policy = this.policiesItem.nth(index);

    expect(await policy.getByTestId("cancellation-policies-time-input").inputValue()).toBe(time.toString());
    expect(await policy.getByTestId("cancellation-policies-select").innerText()).toContain(period);
    expect(await policy.getByTestId("cancellation-policies-amount-input").inputValue()).toBe(amount.toString());
  }
}
