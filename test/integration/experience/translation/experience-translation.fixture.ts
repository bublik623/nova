import { expect, Locator, Page } from "@playwright/test";

export class ExperienceTranslationPage {
  page: Page;
  sendToPreviewBtn: Locator;

  refCode: Locator;

  get url() {
    return this.page.url();
  }

  get goToNextSection() {
    return expect(this.findByTestId("go-to-next-route-button"));
  }

  constructor(page: Page) {
    this.page = page;

    this.refCode = this.findByTestId("document-sidebar-refcode");

    this.sendToPreviewBtn = this.findByTestId("document-action-bar-send-to-translation");
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

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickOnSidebarField(fieldId: string) {
    await this.page.locator(`a[href$="#${fieldId}"]`).click();
  }

  async checkFormFieldValue(fieldId: string, value: unknown) {
    return expect(await this.findById(fieldId).inputValue()).toBe(value);
  }

  async checkEditorValue(EditorId: string, value: string) {
    return expect(
      await this.find(`#${EditorId} > [data-testid='nova-text-editor-tiptap-editor']`)
        .innerText()
        .then((el) => el.trim())
    ).toBe(value.trim());
  }

  async checkHighlightsRow(testId: string, nth: number, text: string) {
    expect(await this.findByTestId(testId).getByTestId("highlights-wrapper-list-row").nth(nth).innerText()).toContain(
      text
    );
  }
}
