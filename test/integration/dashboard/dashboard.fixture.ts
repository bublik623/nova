import { Page, Locator, expect } from "@playwright/test";
import { ExperienceContentV2, Raw, ReferenceCode, ExperienceMedia } from "@/types/generated/ContentQueryApiV2";
import { testId } from "@/utils/test.utils";
import { SortKey } from "@/types/SortingTypes";

export class Dashboard {
  private page: Page;

  searchBar: Locator;
  toggleBtn: Locator;
  createNewExperienceBtn: Locator;

  get url() {
    return this.page.url();
  }

  get rawTableRows() {
    return this.findByTestId("dashboard-table-item-raw");
  }

  get editorialTableRows() {
    return this.findByTestId("dashboard-table-item-editorial");
  }

  get tabs() {
    return this.findByTestId("document-tab-navigation-link");
  }

  constructor(page: Page) {
    this.page = page;

    this.searchBar = this.findByTestId("dashboard-search-bar-input-text");
    this.toggleBtn = this.findByTestId("dashboard-toggle");
    this.createNewExperienceBtn = this.findByTestId("dashboard-new-experience-btn");
  }

  private findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}] >> visible=true`);
  }

  async clickTestID(testID: string) {
    const item = this.findByTestId(testID);

    if (item == null) {
      throw new Error("Could not find item to click");
    }

    await item.click();
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async searchByTitle(title: string) {
    await this.searchBar.type(title);
    await this.page.waitForRequest(/.*\/experience-.*/);
  }

  async sortBy(key: SortKey) {
    const header = this.page.locator(`text=table.header.${key}`);
    await header.click();
  }

  private revertDateFormat(formattedDate: string) {
    const [day, month, year] = formattedDate.split("/");
    const date = new Date(+year, +month - 1, +day, 2);
    return date.toLocaleDateString("sv");
  }

  async checkRawTableData(rowIndex: number, expectedData: Raw) {
    const row = this.rawTableRows.nth(rowIndex);
    const cells = row.locator("td");

    const title = await cells.nth(0).innerText();
    const refCode = await cells.nth(1).innerText();
    const created = this.revertDateFormat(await cells.nth(2).innerText());
    const updated = this.revertDateFormat(await cells.nth(3).innerText());
    const experienceStatusBadge = await cells.nth(4).locator(testId("experience-status-badge"));

    expect(title).toBe(expectedData.commercial.title);
    expect(refCode).toBe(expectedData.reference_code);
    expect(expectedData.creation_date).toContain(created);
    expect(expectedData.updated_date).toContain(updated);
    expect(await experienceStatusBadge.getAttribute("data-flow-code")).toContain("BASE");
    expect(await experienceStatusBadge.getAttribute("data-status-code")).toContain("IN_CREATION");
  }

  async checkEditorialTableData(
    rowIndex: number,
    expectedData: ExperienceContentV2 & {
      experience_media?: ExperienceMedia;
      reference_code?: ReferenceCode;
    },
    expectedTranslations: ExperienceContentV2[]
  ) {
    const row = this.editorialTableRows.nth(rowIndex);
    const cells = row.locator("td");

    const title = await cells.nth(2).innerText();
    const distributionStatus = await cells.nth(1).getAttribute("data-status");
    const refCode = await cells.nth(3).innerText();
    const created = this.revertDateFormat(await cells.nth(4).innerText());
    const updated = this.revertDateFormat(await cells.nth(5).innerText());
    const experienceStatusBadge = await cells.nth(6).locator(testId("experience-status-badge")).nth(0);
    const mediaExperienceStatusBadge = await cells.nth(6).locator(testId("experience-status-badge")).nth(1);

    expect(title).toBe(expectedData.experience_translation?.title);
    expect(refCode).toBe(expectedData.reference_code);
    expect(expectedData.experience_translation?.creation_date).toContain(created);
    expect(expectedData.experience_translation?.updated_date).toContain(updated);
    expect(await experienceStatusBadge.getAttribute("data-flow-code")).toContain(
      expectedData.experience_translation?.flow_code
    );
    expect(await experienceStatusBadge.getAttribute("data-status-code")).toContain(
      expectedData.experience_translation?.status_code
    );
    expect(await mediaExperienceStatusBadge.getAttribute("data-flow-code")).toContain(
      expectedData.experience_media?.flow_code
    );
    expect(await mediaExperienceStatusBadge.getAttribute("data-status-code")).toContain(
      expectedData.experience_media?.status_code
    );
    expect(distributionStatus).toContain(expectedData.experience_translation?.distribution_status);

    // Check translations
    await row.click();

    const translations = row.locator("[data-testid='expanded-row-item']");
    const translationsCount = await translations.count();
    expect(translationsCount).toBe(expectedTranslations.length);

    if (translationsCount > 0) {
      for (let j = 0; j < translationsCount; j++) {
        const expected = expectedTranslations[j];
        const cells = translations.nth(j).locator("td");

        const distributionStatus = await cells.nth(1).getAttribute("data-status");
        const language = await cells.nth(2).innerText();
        const created = this.revertDateFormat(await cells.nth(4).innerText());
        const updated = this.revertDateFormat(await cells.nth(5).innerText());

        const experienceStatusBadge = await cells.nth(6).locator(testId("experience-status-badge"));

        expect(language).toContain(expected.language_code);
        expect(expected.experience_translation?.creation_date).toContain(created);
        expect(expected.experience_translation?.updated_date).toContain(updated);

        expect(await experienceStatusBadge.getAttribute("data-flow-code")).toContain(
          expected.experience_translation?.flow_code
        );
        expect(await experienceStatusBadge.getAttribute("data-status-code")).toContain(
          expected.experience_translation?.status_code
        );
        expect(distributionStatus).toContain(expected.experience_translation?.distribution_status);
      }
    } else {
      expect(await this.findByTestId("expanded-row-no-items").isVisible()).toBe(true);
    }
  }

  async createNewExperience() {
    const modalCreate = this.findByTestId("modal-create-experience");
    const fieldTitle = this.findByTestId("modal-create-experience-input-text");
    await this.createNewExperienceBtn.click();
    await fieldTitle.fill("new experience test");

    const fieldSupplier = this.findByTestId("supplier-name-input-text");
    // select the test supplier
    await fieldSupplier.click();
    await this.findByTestId("options-list-list-item-test-supplier-id").click();
    // select the product type
    await this.findByTestId("select-button").click();
    await this.findByTestId("options-list-list-item-NOVA").click();

    await modalCreate.locator("[data-testid='modal-create-experience-create-button']").click();
    await this.page.waitForURL(/.*\/experience.*/);
  }

  async editExperienceRaw(index: number) {
    const editButton = this.findByTestId(`dashboard-table-item-raw`)
      .nth(index)
      .locator(`[data-testid='table-action-edit-raw']`);

    await editButton.click();
    await this.page.waitForURL(/.*\/(?:experience|experience-curation).*/);
  }

  async editExperienceEditorial(index: number) {
    const toggle = this.findByTestId(`experience-action-toggle`).nth(index);
    const editButton = this.findByTestId(`experience-action-edit`).nth(index);

    await toggle.click();
    await editButton.click();
    await this.page.waitForURL(/.*\/(?:experience|experience-curation).*/);
  }

  async editExperienceTranslation(index: number, translationIndex: number) {
    const tableRow = this.editorialTableRows.nth(index);
    await tableRow.click();
    const toggle = this.findByTestId(`experience-action-toggle`).nth(translationIndex);
    const editButton = this.findByTestId(`experience-action-edit`).nth(index);
    await toggle.click();
    await editButton.click();
    await this.page.waitForURL(/.*\/(?:translation).*/);
  }

  async deleteExperience(index: number) {
    const deleteButton = this.rawTableRows.nth(index).locator("[data-testid='table-action-delete-raw']");
    await deleteButton.click();

    const confirmButton = this.findByTestId("modal-save-btn");
    await confirmButton.click();
  }
}
