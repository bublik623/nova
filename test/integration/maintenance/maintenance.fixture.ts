import { Page } from "@playwright/test";

export class MaintenancePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getTitle() {
    return this.findByTestId("maintenance__title");
  }

  private findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}] >> visible=true`);
  }
}
