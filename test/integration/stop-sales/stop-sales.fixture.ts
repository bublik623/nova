import { Locator, Page } from "@playwright/test";

export class StopSalesPage {
  private page: Page;

  destinationFilter: Locator;
  experiencesFilter: Locator;
  optionsFilter: Locator;
  datesFilter: Locator;
  multipleDatesButton: Locator;
  timeSlotsFilter: Locator;
  searchButton: Locator;
  firstCheckbox: Locator;
  table: Locator;
  closeSelectedButton: Locator;
  multiSelectCheckbox: Locator;
  inputRadioAll: Locator;
  inputRadioOpen: Locator;
  inputRadioClosed: Locator;
  buttonOpenSelected: Locator;
  checkboxSelectAllFilter: Locator;
  checkboxSelectAllItems: Locator;
  checkboxTimeslice: Locator;
  buttonViewType: Locator;
  optionOverview: Locator;
  checkboxExperience: Locator;
  checkboxOption: Locator;
  cardExperience: Locator;
  cardOption: Locator;

  detailView: Locator;
  overviewView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.destinationFilter = this.findByTestId("button-destination");
    this.firstCheckbox = this.findByTestId("option-label").first();
    this.experiencesFilter = this.findByTestId("button-experiences");
    this.optionsFilter = this.findByTestId("button-options");
    this.datesFilter = this.findByTestId("button-dates");
    this.multipleDatesButton = this.findByTestId("date-mode-multiple");
    this.timeSlotsFilter = this.findByTestId("button-time-slots");
    this.searchButton = this.findByTestId("button-search");
    this.closeSelectedButton = this.findByTestId("button-close-selected");
    this.table = this.findByTestId("stop-sales-table");
    this.multiSelectCheckbox = this.findByTestId("nova-checkbox-container").first();
    this.inputRadioAll = this.findByTestId("input-radio-all");
    this.inputRadioOpen = this.findByTestId("input-radio-open");
    this.inputRadioClosed = this.findByTestId("input-radio-closed");
    this.buttonOpenSelected = this.findByTestId("button-open-selected");
    this.checkboxSelectAllFilter = this.page.locator("#checkbox-select-all");
    this.checkboxSelectAllItems = this.page.locator("#checkbox-select-all-items");
    this.checkboxExperience = this.findByTestId("checkbox-experience").locator("input");
    this.checkboxOption = this.findByTestId("checkbox-option").locator("input");
    this.cardExperience = this.findByTestId("card-experience");
    this.cardOption = this.findByTestId("card-option");
    this.checkboxTimeslice = this.findByTestId("timeslice-checkbox");

    this.detailView = this.findByTestId("detail-view");
    this.overviewView = this.findByTestId("overview-view");
    this.buttonViewType = this.findByTestId("view-type-toggle");
    this.optionOverview = this.findByTestId("view-type-overview");
  }

  waitForLoad() {
    return this.page.waitForSelector(".stop-sales-page");
  }

  findByTestId(testId: string) {
    return this.page.locator(`[data-testid=${testId}]`);
  }

  async findCheckboxByLabel(label: string) {
    return this.page.getByLabel(label).first();
  }

  async selectDateRange(startDateOffset: number) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() + startDateOffset);

    const startDay = startDate.getDate();

    await this.datesFilter.click();
    await this.multipleDatesButton.click();

    const startDateLocator = this.page
      .locator(`button.DateCard:has(div.DateCard__content:has-text("${startDay}")):not(:has(div[disabled="true"]))`)
      .first();
    await startDateLocator.click();
  }

  async updateSlotCapacity(slotIndex: number, newCapacity: number) {
    const slot = this.findByTestId("nova-collapse").nth(slotIndex);

    await slot.locator("[data-testid='actions']").locator("button").click();
    await this.findByTestId("slot-availability-input-input-number").fill(newCapacity.toString());
    await slot.locator("[data-testid='actions']").locator("[data-testid='action-save']").click();
  }

  async updateSlotStatus(slotIndex: number) {
    const slot = this.findByTestId("nova-collapse").nth(slotIndex);

    await slot.locator("button.NovaSwitch").click();
  }
}
