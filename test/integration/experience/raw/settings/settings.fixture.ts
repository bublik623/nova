import { Locator, Page } from "@playwright/test";
import { ExperienceRawPage } from "../experience-raw.fixture";
import { testId } from "@/utils/test.utils";

export class ExperienceRawSettingsPage extends ExperienceRawPage {
  fieldExternalReferenceCode: Locator;

  constructor(page: Page) {
    super(page);

    this.fieldExternalReferenceCode = this.page.getByTestId("external_reference_code-input-text");
  }
}

export class FieldSupplierComponent {
  private page: Page;
  textInput: Locator;

  constructor({ page, fieldTestId }: { page: Page; fieldTestId: string }) {
    this.page = page;
    this.textInput = this.page.locator(testId(fieldTestId));
  }

  async inputValue() {
    return await this.textInput.inputValue();
  }

  async selectedSupplierId() {
    const supplierId = await this.page.locator("[data-supplier-id]").getAttribute("data-supplier-id");
    return supplierId;
  }

  async selectSupplier(value: string) {
    await this.textInput.fill(value);
    await this.textInput.click();
    await this.page.getByText(value).click();
  }

  findEditButton() {
    return this.page.locator(testId("field-supplier-edit-btn"));
  }

  findClearButton() {
    return this.page.locator(testId("supplier-name-input-text-clear-btn"));
  }

  findSaveSelectionButton() {
    return this.page.locator(testId("field-supplier-save-selection-btn"));
  }
}
