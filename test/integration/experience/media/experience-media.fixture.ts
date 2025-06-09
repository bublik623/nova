import { expect, Page, Locator } from "@playwright/test";
import { StatusCode } from "@/types/generated/ContentQueryApiV2";

export class ExperienceMediaPage {
  page: Page;

  refCode: Locator;
  formSection: Locator;
  actionBar: Locator;
  saveDraftBtn: Locator;
  publishBtn: Locator;
  modalExit: Locator;
  sidebarTabs: Locator;
  logo: Locator;
  get url() {
    return this.page.url();
  }

  constructor(page: Page) {
    this.page = page;

    this.refCode = this.findByTestId("document-sidebar-refcode");
    this.formSection = this.findByTestId("document-form-section");
    this.actionBar = this.findByTestId("document-action-bar");
    this.saveDraftBtn = this.findByTestId("document-action-bar-save-content");
    this.sidebarTabs = this.findByTestId("nova-tabs");

    this.publishBtn = this.findByTestId("document-action-bar-publish");
    this.modalExit = this.findByTestId("modal");
    this.logo = this.findByTestId("header-tui-logo");
  }

  findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}]`);
  }

  async loadPage(experienceId: string) {
    await this.navigateTo(`/experience/${experienceId}/media`);
    await this.page.waitForSelector("text=experience.gallery.title");
  }

  async isPublishEnabled(res: boolean) {
    expect(await this.publishBtn.isDisabled()).toBe(!res);
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async waitFor(testId: string) {
    await this.page.waitForSelector(`[data-testid=${testId}]`);
  }

  waitForTimeout(time: number) {
    return this.page.waitForTimeout(time);
  }

  async addGalleryImages(imageIndex: number) {
    await this.findByTestId("nova-image-gallery-button").click();
    await this.waitFor("images-selection-modal");
    await this.findByTestId("image-selection-modal-list-item").nth(imageIndex).locator("input").click();
    await this.findByTestId("images-selection-modal").locator("button").nth(2).click();
  }

  async removeGalleryImage(index: number) {
    const imagePreviewCard = this.findByTestId("nova-sortable-list-item").nth(index);
    const deleteBtn = imagePreviewCard.locator("[data-testid='nova-button-icon']").nth(0);
    await deleteBtn.click();
  }

  async sortGalleryImages(oldIndex: number, newIndex: number) {
    const imagePreviewCard = this.findByTestId("nova-sortable-list-drag-handle").nth(oldIndex);

    await imagePreviewCard.dragTo(this.findByTestId("nova-sortable-list-item").nth(newIndex));
  }

  async checkGalleryImages(filenames: string[]) {
    for (let i = 0; i < filenames.length; i++) {
      const imagePreviewCard = this.findByTestId("nova-sortable-list-item").nth(i);

      expect(await imagePreviewCard.locator("[data-testid='nova-image-preview-card-name']").innerText()).toBe(
        filenames[i]
      );
    }
  }

  checkEndpoint(method: "PUT" | "GET" | "POST", URL: string[]) {
    this.page.on("request", (req) => {
      if (method === req.method()) {
        expect(req.url()).toBe(URL[0]);
      }
    });
  }

  async checkSaveDraftButton(calls: string[]) {
    const callsMade: string[] = [];
    this.page.on("request", (request) => {
      if (request.method() === "PUT" || request.method() === "POST") {
        callsMade.push(request.url());
      }
    });

    // save draft button
    await this.findByTestId("document-action-bar-save-content").click();
    expect(callsMade.every((url) => calls.includes(url))).toBe(true);
    expect(calls.every((url) => callsMade.includes(url))).toBe(true);
    callsMade.length = 0;
  }

  async checkStatus(status: StatusCode) {
    // wait for status to change
    await this.page.locator(`[data-status-code="${status}"]`).waitFor();

    const experienceStatusBadge = this.findByTestId("experience-status-badge");
    const statusCodeAttr = await experienceStatusBadge.getAttribute("data-status-code");
    expect(statusCodeAttr).toContain(status);
  }

  async checkTheUnsavedChangesModal() {
    await this.findByTestId("nova-tabs-item").nth(2).click();

    await this.page.locator("text=modal.experience.exit.btn.save").click();
    await this.findByTestId("document-action-bar-save-content").click();

    await this.findByTestId("header-tui-logo").nth(0).click();
    await this.page.waitForURL("/");
    await this.page.goto("/experience/experience-1/media");
  }
}
