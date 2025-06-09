import { Page, Locator, expect } from "@playwright/test";
import { testId } from "@/utils/test.utils";

export class ExperienceCurationPage {
  page: Page;
  refCode: Locator;
  rawFieldsToggle: Locator;
  viewSelect: Locator;
  actionBar: Locator;
  saveDraftBtn: Locator;
  sendToPreviewBtn: Locator;
  modalExit: Locator;
  logo: Locator;
  additionalServices: Locator;
  featuresFieldCheckboxes: Locator;
  tableItem: Locator;
  tabNav: Locator;
  tabClose: Locator;
  titleInput: Locator;

  get url() {
    return this.page.url();
  }

  get formSection() {
    return this.page.locator(`[data-testid="document-form-section"]:visible`);
  }

  get getSidebarSectionItems() {
    return this.findByTestId("sidebar-section-list").locator("li:visible");
  }

  constructor(page: Page) {
    this.page = page;

    this.refCode = this.findByTestId("document-sidebar-refcode");
    this.viewSelect = this.findByTestId("document-sidebar-view-select");
    this.rawFieldsToggle = this.findByTestId("document-sidebar-raw-fields-toggle");
    this.actionBar = this.findByTestId("document-action-bar");
    this.saveDraftBtn = this.findByTestId("document-action-bar-save-content");
    this.sendToPreviewBtn = this.findByTestId("document-action-bar-send-to-translation");
    this.modalExit = this.findByTestId("modal");
    this.logo = this.findByTestId("header-tui-logo");
    this.additionalServices = this.findByStartsWithTestId("options-list-list-item");
    this.featuresFieldCheckboxes = this.find(`#features ${testId("nova-checkbox-label")}`);
    this.tableItem = this.findByTestId("dashboard-table-item");
    this.tabNav = this.findByTestId("document-tab-navigation-link");
    this.tabClose = this.find(
      `[data-testid=document-tab-navigation-link] > [data-testid=document-tab-navigation-close]`
    );
    this.titleInput = this.findByTestId("editorial-title-input-text");
  }

  findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}]`);
  }

  findByStartsWithTestId(testId: string) {
    return this.page.locator(`[data-testid^=${testId}]`);
  }

  findByText(text: string) {
    return this.page.locator(`text=${text}`);
  }

  async waitForSelector(selector: string) {
    await this.page.waitForSelector(selector);
  }

  getTestId(testId: string) {
    return `[data-testid="${testId}"]`;
  }

  findSectionItem(translationLabel: string) {
    return this.page.locator(`.SidebarSection`).locator(`text=${translationLabel}`);
  }

  async clickSidebarLink(id: string) {
    await this.findByTestId(`sidebar-section-wrapper-${id}`).locator("[data-testid='sidebar-section-button']").click();
  }

  find(testId: string) {
    return this.page.locator(testId);
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async checkField(testId: string, value?: string, isDisabled?: boolean) {
    const field = this.findByTestId(testId);
    expect(await field.inputValue()).toBe(value);
    expect(await field.isDisabled()).toBe(!!isDisabled);
  }

  async checkTextEditor(testId: string, value?: string, isReadonly?: boolean) {
    const editor = this.findByTestId(testId);

    if (!isReadonly) {
      expect((await editor.locator("[data-testid='nova-text-editor-tiptap-editor']").innerText()).trim()).toBe(value);
    } else {
      expect(await editor.textContent()).toBe(value);
    }
  }

  async checkAdditionalServices(services: string[]) {
    for (const i in services) {
      expect(await this.additionalServices.nth(parseInt(i)).innerText()).toBe(services[i]);
    }
  }

  async checkFeatures(featureNames: string[]) {
    for (const i in featureNames) {
      expect(await this.featuresFieldCheckboxes.nth(parseInt(i)).innerText()).toBe(featureNames[i]);
    }
  }

  async filterByCommercialViewType() {
    await this.viewSelect.click();

    const options = this.findByTestId("options-list-list-item-commercial");
    await options.click();
  }

  async filterByAllViewType() {
    await this.viewSelect.click();

    const options = this.findByTestId("options-list-list-item-all");
    await options.click();
  }

  async selectNatGeoBrand() {
    await this.findByTestId("input-radio-BRAND_NATIONAL_GEOGRAPHIC").click();

    await this.waitForSelector("text=experience.nat_geo_tour_level.title");
  }

  async closeModal() {
    await this.waitForSelector("text=experience.location.city.title");
    await this.findByTestId("modal-leave-btn").click();
  }

  async checkSaveButtonsAttribute(attribute: string, value: unknown) {
    const saveDraftAndGoButton = testId("go-to-next-route-button");

    expect(await this.saveDraftBtn.getAttribute(attribute)).toBe(value);
    expect(await this.page.locator(saveDraftAndGoButton).getAttribute(attribute)).toBe(value);
  }

  async checkNotifications(text: string) {
    const notification = this.findByTestId("nova-toast").nth(0);
    await expect(notification).toContainText(text);
  }

  async saveDraft(checkNotification = "notifications.success.saving.document") {
    await this.saveDraftBtn.click();
    await this.checkNotifications(checkNotification);
  }

  async saveDraftAndGoToNextSection(checkNotification = "notifications.success.saving.document") {
    const saveDraftAndGoButton = testId("go-to-next-route-button");
    await this.page.locator(saveDraftAndGoButton).click();
    await this.checkNotifications(checkNotification);
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

  async clickSidebarSection(section: string) {
    await this.page.locator(`[data-testid="sidebar-section-wrapper-${section}"]`).click();
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

    const view = this.page.url().split("?")[1];
    const section = nextSection === "location" ? "location" : "settings";
    const sectionWithView = view ? section + "?" + view : section;
    const nextSectionWithView = view ? nextSection + "?" + view : nextSection;

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
      await this.page.waitForURL(`experience/experience-1/curation/${sectionWithView}*`);
      await this.page.goto(currentURL);
    }

    if (nextSection?.length) {
      // save and go to next section button
      await this.saveDraftAndGoToNextSection();
      expect(callsMade.every((url) => calls.includes(url))).toBe(true);
      // check the redirect
      await this.page.waitForURL(`experience/experience-1/curation/${nextSectionWithView}*`);
    }
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
