import { expect, Page } from "@playwright/test";

export class CommercialContentPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get url() {
    return this.page.url();
  }

  findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}]`);
  }

  findById(id: string) {
    return this.page.locator(`#${id}`);
  }

  find(id: string) {
    return this.page.locator(`${id}`);
  }

  async checkFormFieldValue(fieldId: string, value: unknown) {
    return expect(await this.findById(fieldId).inputValue()).toBe(value);
  }
}
