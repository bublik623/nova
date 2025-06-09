import { Page, Locator, expect } from "@playwright/test";
import { testId } from "@/utils/test.utils";

export class ExperienceRawPage {
  page: Page;

  refCode: Locator;
  formSection: Locator;
  titleInput: Locator;
  titleInputError: Locator;
  supplierInput: Locator;
  actionBar: Locator;
  additionalServices: Locator;
  sendToReviewButton: Locator;
  saveDraftButton: Locator;
  deleteButton: Locator;
  sidebarSections: Locator;
  modalCurationLevelAttribute: Locator;
  modalPriorityAttribute: Locator;
  modalAttributeConfirmButton: Locator;
  modalAttributeCancelButton: Locator;
  modalUnsavedChanges: Locator;

  get url() {
    return this.page.url();
  }

  get tabs() {
    return this.findByTestId("document-tab-navigation-link");
  }

  constructor(page: Page) {
    this.page = page;

    this.refCode = this.findByTestId("document-sidebar-refcode");
    this.formSection = this.findByTestId("document-form-section");
    this.actionBar = this.findByTestId("document-action-bar");
    this.titleInput = this.findByTestId("title-input-text");
    this.titleInputError = this.findByText("experience.title.input.error");
    this.supplierInput = this.findByTestId("supplier-name-input-text");
    this.sendToReviewButton = this.findByTestId("document-action-bar-send-to-preview");
    this.saveDraftButton = this.findByTestId("document-action-bar-save-content");
    this.deleteButton = this.findByTestId("delete-btn");
    this.additionalServices = this.findByStartsWithTestId("options-list-list-item");
    this.sidebarSections = this.findByTestId("sidebar-section-button");
    this.modalCurationLevelAttribute = this.findByTestId("modal-distribution-attribute-curation-level");
    this.modalPriorityAttribute = this.findByTestId("modal-distribution-attribute-priority");
    this.modalAttributeConfirmButton = this.findByTestId("modal-distribution-submit");
    this.modalAttributeCancelButton = this.findByTestId("modal-distribution-cancel");
    this.modalUnsavedChanges = this.page.getByText(
      "modal.experience.exit.title.savemodal.experience.exit.description.save-"
    );
  }

  getTestId(testId: string) {
    return `[data-testid="${testId}"]`;
  }

  findByTestId(testId: string) {
    return this.page.locator(this.getTestId(testId));
  }

  findByStartsWithTestId(testId: string) {
    return this.page.locator(`[data-testid^=${testId}]`);
  }

  findSectionItem(translationLabel: string) {
    return this.page.locator(`.SidebarSection`).locator(`text=${translationLabel}`);
  }

  findByText(text: string) {
    return this.page.locator(`text=${text}`);
  }

  find(param: string) {
    return this.page.locator(param);
  }

  async clearSupplierId() {
    await this.page.getByTestId("supplier-name-input-text-clear-btn").click();
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async clickSidebarLink(id: string) {
    await this.findByTestId(`sidebar-section-wrapper-${id}`).locator("[data-testid='sidebar-section-button']").click();
  }

  async checkField(testId: string, value?: string, isDisabled?: boolean) {
    const field = this.findByTestId(testId);
    expect(await field.inputValue()).toBe(value);
    expect(await field.isDisabled()).toBe(!!isDisabled);
  }

  async checkRadioGroupValue(testId: string, value: string) {
    const radios = await this.findByTestId(testId).locator("input").all();
    for (const radio of radios) {
      const radioName = await radio.getAttribute("data-testid");
      if (radioName?.includes(value)) {
        expect(await radio.isChecked()).toBeTruthy();
      }
    }
  }

  async checkTextEditor(testId: string, value?: string, isDisabled?: boolean) {
    const editor = this.findByTestId(testId);

    expect((await editor.locator("[data-testid='nova-text-editor-tiptap-editor']").innerText()).trim()).toBe(
      value ?? ""
    );
    expect(await editor.getAttribute("disabled")).toBe(isDisabled ? "true" : null);
  }

  async checkCategoriesAndInterests(values: { category?: string; interests?: string[] }) {
    const { category = "", interests = [] } = values;
    const categoryField = this.findByTestId("experience-category");

    await expect(categoryField.locator("p").nth(0)).toHaveText(category);
    await expect(categoryField.locator("p").nth(1)).toHaveText(interests.join(", "));
  }

  async checkAdditionalServices(services: string[]) {
    for (const i in services) {
      expect(await this.additionalServices.nth(parseInt(i)).innerText()).toBe(services[i]);
    }
  }

  async deleteExperience() {
    await this.deleteButton.click();

    const confirmButton = this.findByTestId("modal-save-btn");
    await confirmButton.click();
  }

  waitForTimeout(time: number) {
    return this.page.waitForTimeout(time);
  }

  async waitForSelector(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async clickSidebarSection(section: string) {
    await this.page.locator(`[data-testid="sidebar-section-wrapper-${section}"]`).click();
  }

  async sidebarItemState(item: string): Promise<{ completed: boolean; disabled: boolean; required: boolean }> {
    // The attributes are not in the direct locator, so we need to get the innerHTML and check if the attribute is there
    const locator = this.page.locator(`[data-testid="sidebar-section-item-${item}"]`);
    const innerHtml = await locator.innerHTML();
    const completed = innerHtml.includes('completed="true"');
    const disabled = innerHtml.includes('disabled="true"');
    const required = innerHtml.includes('required="true"');

    return {
      completed,
      disabled,
      required,
    };
  }

  async clickSidebarItem(item: string) {
    await this.page.locator(`[data-testid="sidebar-section-item-${item}"]`).click();
  }

  async isSectionDisabled(section: string) {
    return await this.findByTestId(`sidebar-section-wrapper-${section}`).getAttribute("is-disabled");
  }

  async isSectionCompleted(section: string) {
    return await this.page
      .locator(
        `[data-testid="sidebar-section-wrapper-${section}"] > [data-testid="sidebar-section-button"] > [data-testid="sidebar-section-circle-category"]`
      )
      .getAttribute("completed");
  }

  async selectCategoriesAndInterests(category: string, interests: string[]) {
    // Select category and go next
    await this.findByText(category).click();
    await this.findByTestId("category-modal-next-btn").click();

    // Select Interests
    for (const interest of interests) {
      await this.findByText(interest).click();
    }

    // Save
    await this.findByTestId("category-modal-save-btn").click();
  }

  async checkNatGeoTourLevel() {
    await this.findByTestId("input-radio-BRAND_NATIONAL_GEOGRAPHIC").check();

    await this.page.waitForSelector(testId("input-radio-NAT_GEO_TOUR_LEVEL_PREMIUM"));
  }

  async checkSaveButtonsAttribute(attribute: string, value: unknown) {
    const saveDraftButton = testId("document-action-bar-save-content");
    const saveDraftAndGoButton = testId("go-to-next-route-button");

    expect(await this.page.locator(saveDraftButton).getAttribute(attribute)).toBe(value);
    expect(await this.page.locator(saveDraftAndGoButton).getAttribute(attribute)).toBe(value);
  }

  async checkNotifications(text: string) {
    const notification = this.findByTestId("nova-toast").nth(0);
    expect(await notification.innerText()).toContain(text);
  }
  async saveDraft(checkNotification = "notifications.success.saving.document") {
    await this.saveDraftButton.click();
    await this.checkNotifications(checkNotification);
  }

  async saveDraftAndGoToNextSection(checkNotification = "notifications.success.saving.document") {
    const saveDraftAndGoButton = testId("go-to-next-route-button");
    await this.page.locator(saveDraftAndGoButton).click();
    await this.checkNotifications(checkNotification);
  }

  async checkSaveDraftButtons(calls: string[], checkModal?: boolean, nextSection?: string) {
    // checking all the calls
    const callsMade: string[] = [];
    const currentURL = this.page.url();
    this.page.on("request", (request) => {
      if (!request.url().includes("localhost")) {
        return; // ignore 3rd party calls
      }
      if (request.method() === "PUT" || request.method() === "POST") {
        callsMade.push(request.url());
      }
    });

    const section = nextSection === "location" ? "location" : "settings";

    // check unsaved changes modal
    if (checkModal) {
      await this.modifyDocument();
      if (await this.page.isVisible(testId("modal-save-btn"))) {
        await this.findByTestId("modal-save-btn").click(); // accept the modal
      }
      await this.clickSidebarSection(section);
      await this.page.locator("text=modal.experience.exit.btn.save").click();
    }

    // save draft button
    await this.saveDraft();
    expect(callsMade.every((url) => calls.includes(url))).toBe(true);
    expect(calls.every((url) => callsMade.includes(url))).toBe(true);
    callsMade.length = 0;

    // check unsaved changes modal
    if (checkModal) {
      await this.clickSidebarSection(section);
      await this.page.waitForURL(`/experience/test-id/raw/${section}*`);
      await this.page.goto(currentURL);
    }

    if (nextSection?.length) {
      // save and go to next section button
      await this.saveDraftAndGoToNextSection();
      expect(callsMade.every((url) => calls.includes(url))).toBe(true);
      // check the redirect
      await this.page.waitForURL(`/experience/test-id/raw/${nextSection}`);
    }
  }

  async failRequest(url: string, method: "GET" | "PUT" | "POST") {
    await this.page.route(url, async (route, req) => {
      if (req.method() === method) {
        await route.abort();
      }
    });
  }

  async countSidebarItems(section: string, count: number) {
    const sect = this.findByTestId(`sidebar-section-wrapper-${section}`);
    await this.clickSidebarLink(section);
    expect(await sect.locator("li").count()).toBe(count);
  }

  async checkRequest(url: string | RegExp, trigger: Locator) {
    const requestPromise = this.page.waitForRequest(url);
    await trigger.click();
    return await requestPromise;
  }

  async modifyDocument() {
    const inputText = this.page.locator(".form").getByRole("textbox").nth(0);
    const textEditor = this.page.locator(testId("nova-text-editor-tiptap-editor")).nth(0);
    const checkbox = this.page.locator(testId("nova-checkbox-container")).nth(0);
    const radios = this.page.locator(".form").getByRole("radio");

    if (await textEditor.isVisible()) {
      await textEditor.click();
      await this.page.type(testId("nova-text-editor-tiptap-editor"), "New value");
    } else if (await inputText.isVisible()) {
      await inputText.fill("New value");
    } else if (await checkbox.isVisible()) {
      await checkbox.click();
    } else if (await radios.nth(0).isVisible()) {
      await radios.nth(0).click();
      await radios.nth(1).click();
    }
  }
}
