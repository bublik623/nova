import { Locator, Page } from "@playwright/test";
import { findInlineMultiSelect, findInlineSelect } from "../../test-utils/inline-select-selectors";
import { findDatePicker } from "../../test-utils/date-picker-selectors";

export class PriceSectionPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get table() {
    return {
      element: () => this.page.getByTestId("table-price"),
      optionHeader: () => this.page.getByTestId("column-option"),
      dateRangeHeader: () => this.page.getByTestId("column-date-range"),
      currencyHeader: () => this.page.getByTestId("column-currency"),
      languagesHeader: () => this.page.getByTestId("column-languages"),
      zonesHeader: () => this.page.getByTestId("column-zones"),
      daysHeader: () => this.page.getByTestId("column-days"),
    };
  }

  get saveButton() {
    return this.page.getByTestId("go-to-next-route-button");
  }

  get addNewPriceButton() {
    return this.page.getByTestId("button-new-line");
  }

  get rows() {
    return this.page.getByTestId("row-price");
  }

  getRow(index: number) {
    return findRow(this.page, index);
  }

  getPostPriceRequest() {
    return this.page.waitForRequest((request) => {
      const isPricingsCollectionUrl = request.url().endsWith("/internal-product/pricings");
      const isPostRequest = request.method() === "POST";
      return isPricingsCollectionUrl && isPostRequest;
    });
  }
}

async function findRow(page: Page, index: number) {
  const rows = page.getByTestId("row-price");
  const row = rows.nth(index);
  const rowId = await row.getAttribute("data-row-id");

  return {
    element: () => row,
    getSubRow: (index: number) => findSubRow(page, index, rowId),
    // fields
    optionSelect: () => findOptionSelect(page, row.getByTestId("cell-option")),
    dateRange: () => findDateRange(page, row.getByTestId("cell-date-range")),
    currencySelect: () => findCurrencySelect(page, row.getByTestId("cell-currency")),
    languagesSelect: () => findLanguagesSelect(page, row.getByTestId("cell-languages")),
    daysSelect: () => findDaysSelect(page, row.getByTestId("cell-days")),
    // action buttons
    collapseButton: () => row.getByTestId("button-collapse"),
    deleteButton: () => row.getByTestId("button-delete"),
    duplicateButton: () => row.getByTestId("button-duplicate"),
  };
}

function findSubRow(page: Page, index: number, parentId: string | null) {
  const rows = page.locator(`[data-testid="sub-row-pax"][data-parent-id="${parentId}"]`);
  const row = rows.nth(index);

  const subRowHeader = page.locator(`[data-testid="sub-row-heading"][data-parent-id="${parentId}"]`);
  const subRowHeaderColumns = {
    // column headers
    paxLabelHeader: () => subRowHeader.getByTestId("column-pax-label"),
    costHeader: () => subRowHeader.getByTestId("column-cost"),
    suggestedPriceHeader: () => subRowHeader.getByTestId("column-suggested-price"),
    initialPriceHeader: () => subRowHeader.getByTestId("column-initial-price"),
  };

  return {
    header: subRowHeaderColumns,
    isVisible: async () => row.isVisible(),
    paxLabel: () => row.getByTestId("cell-pax-label"),
    costInput: () => row.getByTestId("input-pax-cost"),
    suggestedPriceInput: () => row.getByTestId("input-pax-suggested-price"),
    initialPriceInput: () => row.getByTestId("input-pax-initial-price"),
  };
}

// configured finders here because sonar complains about cognitive complexity when we have
// long functions/classes
function findOptionSelect(page: Page, parentLocator?: Locator) {
  return findInlineSelect(page, {
    triggerTestId: "inline-select-trigger",
    contentTestId: "option-select-content",
    searchTestId: "inline-select-search",
    parentLocator,
  });
}

function findDateRange(page: Page, parentLocator?: Locator) {
  return findDatePicker(page, {
    triggerTestId: "date-picker-trigger",
    calendarTestId: "nova-date-picker",
    parentLocator,
  });
}

function findCurrencySelect(page: Page, parentLocator?: Locator) {
  return findInlineSelect(page, {
    triggerTestId: "inline-select-trigger",
    contentTestId: "currency-select-content",
    searchTestId: "inline-select-search",
    parentLocator,
  });
}

function findLanguagesSelect(page: Page, parentLocator?: Locator) {
  return findInlineMultiSelect(page, {
    triggerTestId: "inline-select-trigger",
    contentTestId: "languages-select-content",
    searchTestId: "inline-select-search",
    parentLocator,
  });
}

function findDaysSelect(page: Page, parentLocator?: Locator) {
  return findInlineMultiSelect(page, {
    triggerTestId: "inline-select-trigger",
    contentTestId: "days-select-content",
    searchTestId: "inline-select-search",
    parentLocator,
  });
}
