import { Locator, Page, expect } from "@playwright/test";
import { ExperienceRawPage } from "../experience-raw.fixture";

export class ExperienceRawPricingAndAvailabilityPage extends ExperienceRawPage {
  policiesModal: Locator;
  policiesItem: Locator;
  policiesItemReadonly: Locator;
  fieldExternalReferenceCode: Locator;
  fieldPax: ReturnType<typeof fieldPaxFinders>;
  saveAndGoNextButton: Locator;

  constructor(page: Page) {
    super(page);

    this.fieldExternalReferenceCode = this.page.getByTestId("external_reference_code-input-text");
    this.policiesModal = this.page.getByTestId("cancellation-policies-modal");
    this.policiesItem = this.page.getByTestId("cancellation-policies-item");
    this.policiesItemReadonly = this.page.getByTestId("cancellation-policies-item-readonly");

    this.fieldPax = fieldPaxFinders(this.page);
    this.saveAndGoNextButton = this.page.getByTestId("go-to-next-route-button");
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

const fieldPaxFinders = (page: Page) => {
  return {
    paxes: () => page.getByTestId("pax-item"),
    paxCheckbox: (code: string) => page.locator(`#pax-item-${code}-checkbox`),
    freeOfChargeCheckbox: (code: string) => page.locator(`#pax-item-${code}-free-of-charge`),
    ageFromInput: (code: string) => page.locator(`#pax-item-${code}-age-from`),
    ageToInput: (code: string) => page.locator(`#pax-item-${code}-age-to`),
    allAgesCheckbox: (code: string) => page.locator(`#pax-item-${code}-all-ages`),
  };
};
