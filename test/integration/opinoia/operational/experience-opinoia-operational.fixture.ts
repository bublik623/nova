import { Page, Locator } from "@playwright/test";

export class OpinoiaOperationalPage {
  page: Page;

  refCode: Locator;

  constructor(page: Page) {
    this.page = page;

    this.refCode = this.findByTestId("experience-reference-code");
  }

  getTestId(testId: string) {
    return `[data-testid="${testId}"]`;
  }

  findByTestId(testId: string) {
    return this.page.locator(this.getTestId(testId));
  }
}
