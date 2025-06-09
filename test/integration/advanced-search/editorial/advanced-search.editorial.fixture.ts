import { Locator, Page } from "@playwright/test";

export type RowData = {
  isSelected: boolean;
  hasTranslations: boolean;
  title: string;
  titleHighlightHTML: string;
  refCode: string;
  status: string | null;
  lastModified: string;
  supplier: string;
  city: string;
  country: string;
  published: string;
  created: string;
};

export type TranslationRowData = {
  flagIconAlt: string | null;
  languageCode: string | null;
  titleTranslation: string | null;
  titleTranslationHighlightHTML: string | null;
  status: string | null;
};

export class AdvancedSearchEditorialPage {
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
        isSelected: await tdLocator.nth(columnIndex.checkboxColumnIndex).locator("input").isChecked(),
        hasTranslations: await tdLocator.nth(columnIndex.translationToggleColumnIndex).locator("button").isEnabled(),
        title: await tdLocator.nth(columnIndex.titleColumnIndex).innerText(),
        titleHighlightHTML: await this.getTitleHighlightHTML(tdLocator),
        refCode: await tdLocator.nth(columnIndex.refCodeColumnIndex).innerText(),
        status: await tdLocator
          .nth(columnIndex.statusColumnIndex)
          .locator("svg")
          .getAttribute("data-distribution-status"),
        lastModified: await tdLocator.nth(columnIndex.lastModifiedColumnIndex).innerText(),
        supplier: await tdLocator.nth(columnIndex.supplierColumnIndex).innerText(),
        city: await tdLocator.nth(columnIndex.cityColumnIndex).innerText(),
        country: await tdLocator.nth(columnIndex.countryColumnIndex).innerText(),
        published: await tdLocator.nth(columnIndex.publishedColumnIndex).innerText(),
        created: await tdLocator.nth(columnIndex.createdColumnIndex).innerText(),
      });
    }

    return tableData;
  }

  async getTitleHighlightHTML(tdLocators: Locator) {
    const titleHighlightSpanLocator = tdLocators
      .nth(columnIndex.titleColumnIndex)
      .locator("p")
      .nth(0)
      .locator("span")
      .nth(0);
    const highlightExists = await titleHighlightSpanLocator.isVisible();

    return highlightExists ? await titleHighlightSpanLocator.innerHTML() : "";
  }

  getTranslationsRows() {
    return this.page.getByTestId(testIds.translationsRows);
  }

  async getTranslationsData(): Promise<TranslationRowData[]> {
    const translationsData = [];

    for (const trLocator of await this.getTranslationsRows().all()) {
      const tdLocator = trLocator.locator("td");
      translationsData.push({
        flagIconAlt: await tdLocator
          .nth(translationColumnIndex.flagIconColumnIndex)
          .locator("div>img")
          .getAttribute("alt"),
        languageCode: await tdLocator
          .nth(translationColumnIndex.languageCodeColumnIndex)
          .locator("p")
          .first()
          .innerText(),
        titleTranslation: await tdLocator
          .nth(translationColumnIndex.titleTranslationColumnIndex)
          .locator("p")
          .nth(1)
          .innerText(),
        titleTranslationHighlightHTML: await this.getTitleTranslationHighlightHTML(tdLocator),
        status: await tdLocator
          .nth(translationColumnIndex.statusColumnIndex)
          .locator("svg")
          .getAttribute("data-distribution-status"),
      });
    }

    return translationsData;
  }

  async getTitleTranslationHighlightHTML(tdLocators: Locator) {
    const titleHighlightSpanLocator = tdLocators
      .nth(translationColumnIndex.titleTranslationColumnIndex)
      .locator("p")
      .nth(1)
      .locator("span")
      .nth(0);
    const highlightExists = await titleHighlightSpanLocator.isVisible();

    return highlightExists ? await titleHighlightSpanLocator.innerHTML() : "";
  }

  async clickOnTranslationToggleOfFirstRow() {
    await this.getCellLocator(0, columnIndex.translationToggleColumnIndex).locator("button").click();
  }

  async clickOnTitleOfFirstTranslation() {
    await this.getTranslationsRows()
      .first()
      .locator("td")
      .nth(translationColumnIndex.titleTranslationColumnIndex)
      .locator("p")
      .nth(1)
      .click();
  }

  async clickOnTitleOfFirstRow() {
    await this.getCellLocator(0, columnIndex.titleColumnIndex).locator("p").click();
  }

  async clickOnRefCodeColumnHeader() {
    await this.page.getByTestId(testIds.refCodeColumnHeader).click();
  }

  async clickOnEditorialToggle() {
    await this.page.getByTestId(testIds.editorialRawToggle).click();
  }

  async setPublicationDateFilter(fromDayOfCurrentMonth: number, toDayOfCurrentMonth: number) {
    await this.setDateRangeFilter("publicationDate", fromDayOfCurrentMonth, toDayOfCurrentMonth);
  }

  async setDateRangeFilter(filterKey: string, fromDayOfCurrentMonth: number, toDayOfCurrentMonth: number) {
    await this.page.getByTestId(testIds.dateRangeFilterInput(filterKey)).first().click();
    const daysOfCurrentMonth = this.page.locator(
      `[data-testid=${testIds.dateRangeFilterCalendar(filterKey)}] > .DatePicker__days > button[data-testid=${
        testIds.dayOfMonth
      }]:not([other-month])`
    );
    await daysOfCurrentMonth.getByText(fromDayOfCurrentMonth.toString(), { exact: true }).click();
    await daysOfCurrentMonth.getByText(toDayOfCurrentMonth.toString(), { exact: true }).click();
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

  private getCellLocator(rowIndex: number, columnIndex: number) {
    return this.page.getByTestId(testIds.rows).nth(rowIndex).locator("td").nth(columnIndex);
  }
}

const columnIndex = {
  get checkboxColumnIndex() {
    return 0;
  },
  get translationToggleColumnIndex() {
    return 1;
  },
  get titleColumnIndex() {
    return 2;
  },
  get refCodeColumnIndex() {
    return 3;
  },
  get statusColumnIndex() {
    return 4;
  },
  get lastModifiedColumnIndex() {
    return 5;
  },
  get supplierColumnIndex() {
    return 6;
  },
  get cityColumnIndex() {
    return 7;
  },
  get countryColumnIndex() {
    return 8;
  },
  get publishedColumnIndex() {
    return 9;
  },
  get createdColumnIndex() {
    return 10;
  },
};

const translationColumnIndex = {
  get flagIconColumnIndex() {
    return 2;
  },
  get languageCodeColumnIndex() {
    return 2;
  },
  get titleTranslationColumnIndex() {
    return 2;
  },
  get statusColumnIndex() {
    return 4;
  },
};

const testIds = {
  get rows() {
    return "adv-search-table-item";
  },
  get translationsRows() {
    return "adv-search-table-translation-item";
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
