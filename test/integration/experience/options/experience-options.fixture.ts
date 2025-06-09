import { expect, Locator, Page } from "@playwright/test";

export class ExperienceOptionPage {
  readonly page: Page;

  formSection: Locator;

  constructor(page: Page) {
    this.page = page;

    this.formSection = this.findByTestId("document-form-section");
  }

  findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}]`);
  }

  findByStartsWithTestId(testId: string) {
    return this.page.locator(`[data-testid^=${testId}]`);
  }

  find(string: string) {
    return this.page.locator(string);
  }

  goToNextSectionButton() {
    return this.findByTestId("go-to-next-route-button");
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async waitFor(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async waitForNavigation(url: string) {
    await this.page.waitForNavigation({ url });
  }

  async clickSidebarLink(id: string) {
    await this.page.locator(`a[href$="${id}"]`).click();
  }

  async checkUrl(url: string) {
    expect(await this.page.url()).toContain(url);
  }

  async isLinkVisible(id: string) {
    expect(await this.page.locator(`a[href$="${id}"]`).isVisible()).toBeTruthy();
  }

  async checkField(testId: string, value?: string) {
    const field = this.findByTestId(testId);
    expect(await field.inputValue()).toBe(value);
  }

  async checkRadioGroup(testId: string, amount: number) {
    const group = this.findByTestId(testId);
    const radios = group.locator("label");
    const checked = group.locator("input[type='radio']:checked");

    expect(await radios.count()).toBe(amount);

    expect(await checked.count()).toBe(1);
    expect(await checked.isChecked()).toBe(true);
  }

  async isVisible(testId: string, value: boolean) {
    const field = this.findByTestId(testId);

    expect(await field.isVisible()).toBe(value);
  }
}
