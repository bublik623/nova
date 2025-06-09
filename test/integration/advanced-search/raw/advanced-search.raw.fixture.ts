import { Locator, Page } from "@playwright/test";

export type RowData = {
  isSelected: boolean;
  title: string;
  titleHighlightHTML: string;
  refCode: string;
  lastModified: string;
  supplier: string;
  city: string;
  country: string;
  created: string;
};

const checkboxColumnIndex = 0;
const titleColumnIndex = 1;
const refCodeColumnIndex = 2;
const lastModifiedColumnIndex = 3;
const supplierColumnIndex = 4;
const cityColumnIndex = 5;
const countryColumnIndex = 6;
const createdColumnIndex = 7;

const testIds = {
  get rows() {
    return "adv-search-table-item";
  },
  get queryInput() {
    return "advanced-search-query-input-input-text";
  },
  get searchButton() {
    return "advanced-search-query-button";
  },
  get exportButton() {
    return "advanced-search-export-button";
  },
  get refCodeColumnHeader() {
    return "adv-search-th-ref-code";
  },
  get editorialRawToggle() {
    return "editorial-raw-toggle";
  },
  dateRangeFilterInput(filterKey: string) {
    return `advanced-search-date-range-${filterKey}-input-date-input`;
  },
  dateRangeFilterCalendar(filterKey: string) {
    return `advanced-search-date-range-${filterKey}-input-date-calendar`;
  },
  get dayOfMonth() {
    return "date-card";
  },
  get applyFiltersButton() {
    return "advanced-search-apply-filters";
  },
  get clearFiltersButton() {
    return "advanced-search-clear-filters";
  },
};

export class AdvancedSearchRawPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForDataToLoad() {
    return await this.page.waitForSelector(`[data-testid='${testIds.rows}']`);
  }

  getTableRows() {
    return this.page.getByTestId(testIds.rows);
  }

  async getTableRowCount() {
    return await this.getTableRows().count();
  }

  async setQuery(query: string) {
    return await this.page.getByTestId(testIds.queryInput).fill(query);
  }

  async clickSearchButton() {
    return await this.page.getByTestId(testIds.searchButton).click();
  }

  getExportButton() {
    return this.page.getByTestId(testIds.exportButton);
  }

  async clickExportButton() {
    return await this.page.getByTestId(testIds.exportButton).click();
  }

  async exportDownload() {
    return await this.page.waitForEvent("download");
  }

  async getTableData(): Promise<RowData[]> {
    const tableData = [];

    for (const trLocator of await this.getTableRows().all()) {
      const tdLocator = trLocator.locator("td");
      tableData.push({
        isSelected: await tdLocator.nth(checkboxColumnIndex).locator("input").isChecked(),
        title: await tdLocator.nth(titleColumnIndex).innerText(),
        titleHighlightHTML: await this.getTitleHighlightHTML(tdLocator),
        refCode: await tdLocator.nth(refCodeColumnIndex).innerText(),
        lastModified: await tdLocator.nth(lastModifiedColumnIndex).innerText(),
        supplier: await tdLocator.nth(supplierColumnIndex).innerText(),
        city: await tdLocator.nth(cityColumnIndex).innerText(),
        country: await tdLocator.nth(countryColumnIndex).innerText(),
        created: await tdLocator.nth(createdColumnIndex).innerText(),
      });
    }

    return tableData;
  }

  async getTitleHighlightHTML(tdLocators: Locator) {
    const titleHighlightSpanLocator = tdLocators.nth(titleColumnIndex).locator("p").nth(0).locator("span").nth(0);
    const highlightExists = await titleHighlightSpanLocator.isVisible();

    return highlightExists ? await titleHighlightSpanLocator.innerHTML() : "";
  }

  async clickOnTitleOfFirstRow() {
    await this.page.getByTestId(testIds.rows).nth(0).locator("td").nth(titleColumnIndex).locator("p").click();
  }

  async clickOnRefCodeColumnHeader() {
    await this.page.getByTestId(testIds.refCodeColumnHeader).click();
  }

  async clickOnEditorialToggle() {
    await this.page.getByTestId(testIds.editorialRawToggle).click();
  }

  async setCreationDateFilter(fromDayOfCurrentMonth: number, toDayOfCurrentMonth: number) {
    await this.setDateRangeFilter("creationDate", fromDayOfCurrentMonth, toDayOfCurrentMonth);
  }

  async setDateRangeFilter(filterKey: string, fromDayOfCurrentMonth: number, toDayOfCurrentMonth: number) {
    // Open the date range filter
    await this.page.getByTestId(testIds.dateRangeFilterInput(filterKey)).first().click();
    const daysOfCurrentMonth = this.page.locator(
      `[data-testid=${testIds.dateRangeFilterCalendar(filterKey)}] > .DatePicker__days > button[data-testid=${
        testIds.dayOfMonth
      }]:not([other-month])`
    );
    await daysOfCurrentMonth.getByText(fromDayOfCurrentMonth.toString(), { exact: true }).click();
    await daysOfCurrentMonth.getByText(toDayOfCurrentMonth.toString(), { exact: true }).click();
    // Close the date range filter
    await this.page.getByTestId(testIds.dateRangeFilterInput(filterKey)).first().click();
  }

  async clickOnApplyFilters() {
    await this.page.getByTestId(testIds.applyFiltersButton).click();
  }

  async clickOnClearFilters() {
    await this.page.getByTestId(testIds.clearFiltersButton).click();
  }

  async clickOnPageNumber(pageNumber: number) {
    await this.page.getByTestId(`page-${pageNumber}`).click();
  }
}
