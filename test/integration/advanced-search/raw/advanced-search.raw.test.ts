import { test, expect } from "@playwright/test";
import mockApi from "./advanced-search.raw.mocks";
import { AdvancedSearchRawPage, RowData } from "./advanced-search.raw.fixture";
import {
  rawSearchHitsWithNoQuery,
  rawSearchHitsWithQuery,
  suppliers,
  cities,
  rawResultsWithFilters,
  reportFileName,
  reportFileContent,
} from "./advanced-search.raw.data";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { City } from "@/types/generated/GeoMasterDataApi";
import { TypedRawSearchHit } from "@/features/advanced-search/types/seach-hit-overrides";
import { mockRemoteFeatureFlag, waitForFeatureFlagsRefresh } from "../../utils/mockRemoteFeatureFlag";
import { integrationBaseURL } from "@/playwright.config";

const baseURL = integrationBaseURL;

test.describe("advanced search raw page", () => {
  let advancedSearchRawPage: AdvancedSearchRawPage;

  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await mockRemoteFeatureFlag(page, { raw_adv_search_export_enabled: true });

    await page.goto("/advanced-search/raw");

    await waitForFeatureFlagsRefresh(page);

    advancedSearchRawPage = new AdvancedSearchRawPage(page);
    await advancedSearchRawPage.waitForDataToLoad();
  });

  test("should display the raw content after load", async () => {
    const tableData = await advancedSearchRawPage.getTableData();
    expectMatch(tableData, rawSearchHitsWithNoQuery, suppliers);
  });

  test("should navigate to experience detail when title is clicked", async ({ page }) => {
    await advancedSearchRawPage.clickOnTitleOfFirstRow();
    await expect(page).toHaveURL(
      `${baseURL}/experience/${rawSearchHitsWithNoQuery[0].content.experience_id}/raw/settings`
    );
  });

  test("should sort results after clicking on a column header", async ({ page }) => {
    await test.step("sort by id ascending", async () => {
      await advancedSearchRawPage.clickOnRefCodeColumnHeader();
      await expect(page).toHaveURL(/sort-key=reference_code&sort-direction=asc/);
    });

    await test.step("sort by id descending", async () => {
      await advancedSearchRawPage.clickOnRefCodeColumnHeader();
      await expect(page).toHaveURL(/sort-key=reference_code&sort-direction=desc/);
    });
  });

  test("should search raw content when search button is clicked and display the matches in the title column", async ({
    page,
  }) => {
    const query = "a-search-query";

    await advancedSearchRawPage.setQuery(query);
    await advancedSearchRawPage.clickSearchButton();

    const tableData = await advancedSearchRawPage.getTableData();
    expectMatch(tableData, rawSearchHitsWithQuery, suppliers);
    await expect(page).toHaveURL(/query=a-search-query/);
  });

  test("should allow to apply and clear filters", async () => {
    await test.step("apply filters", async () => {
      await advancedSearchRawPage.setCreationDateFilter(4, 10);
      await advancedSearchRawPage.clickOnApplyFilters();
    });

    await test.step("explore the results", async () => {
      const tableData = await advancedSearchRawPage.getTableData();
      expectMatch(tableData, rawResultsWithFilters, suppliers);
    });

    await test.step("clear filters", async () => {
      await advancedSearchRawPage.clickOnClearFilters();
    });
  });

  test("should navigate to advanced search editorial page when the toggle is clicked", async ({ page }) => {
    await advancedSearchRawPage.clickOnEditorialToggle();
    await expect(page).toHaveURL(/\/advanced-search\/editorial/);
  });

  test("the pagination should work as expected", async ({ page }) => {
    await advancedSearchRawPage.clickOnPageNumber(5);
    await page.waitForSelector("text=1-ref_code-p-5");
    await page.waitForSelector("text=common.showing 201 common.to 250 common.of 1000 common.entries");

    await advancedSearchRawPage.clickOnPageNumber(20);
    await page.waitForSelector("text=1-ref_code-p-20");
    await page.waitForSelector("text=common.showing 951 common.to 1000 common.of 1000 common.entries");
  });

  test("should allow downloading the search results as excel file", async () => {
    const exportDownloadPromise = advancedSearchRawPage.exportDownload();
    await advancedSearchRawPage.clickExportButton();
    const download = await exportDownloadPromise;
    const contentStream = await download.createReadStream();
    const content = await new Promise((resolve, reject) => {
      let contentAsString = "";
      contentStream.on("data", function (data) {
        contentAsString += data.toString();
      });
      contentStream.on("end", function () {
        resolve(contentAsString);
      });
      contentStream.on("error", reject);
    });

    expect(download.suggestedFilename()).toBe(reportFileName);
    expect(content).toContain(reportFileContent);
  });
});

function expectMatch(tableData: RowData[], rawSearchHits: TypedRawSearchHit[], suppliers: Supplier[]) {
  expect(tableData.length).toBe(rawSearchHits.length);
  for (let i = 0; i < tableData.length; i++) {
    const tableDataRow = tableData[i];
    const rawSearchHit = rawSearchHits[i];

    expectTitleMatch(tableDataRow, rawSearchHit);
    expect(tableDataRow.refCode).toBe(rawSearchHit.content.reference_code);
    expectDateMatch(tableDataRow.lastModified, rawSearchHit.content.updated_date ?? "");
    expectSupplierMatch(tableDataRow.supplier, rawSearchHit.content.supplier_id, suppliers);
    expectCityMatch(tableDataRow.city, rawSearchHit.content.functional?.location?.address.city ?? "", cities);
    expect(tableDataRow.country).toBe(rawSearchHit.content.functional?.location?.address.country ?? "");
    expectDateMatch(tableDataRow.created, rawSearchHit.content.creation_date ?? "");
  }
}

function expectTitleMatch(rowData: RowData, rawSearchHit: TypedRawSearchHit) {
  const titleKey = "commercial.title";
  const matchHighlights = rawSearchHit.highlight_fields as any;

  if ((matchHighlights?.[titleKey]?.length ?? 0) > 0) {
    expect(rowData.titleHighlightHTML).toBe(matchHighlights[titleKey][0]);
  } else {
    expect(rowData.title).toBe(rawSearchHit.content.commercial.title);
  }
}

function expectDateMatch(dateInTable: string, dateInRaw: string) {
  expect(dateInTable).toBe(convertDateInExpectedFormat(dateInRaw));
}

function convertDateInExpectedFormat(dateInRaw: string) {
  return new Intl.DateTimeFormat("en-gb").format(new Date(dateInRaw));
}

function expectSupplierMatch(supplierInTable: string, supplierIdInRaw: string | undefined, suppliers: Supplier[]) {
  const supplier = suppliers.find((supplier) => supplier.id === supplierIdInRaw);

  expect(supplierInTable).toBe(supplier?.name ?? "");
}

function expectCityMatch(cityInTable: string, cityCodeInRaw: string, cities: City[]) {
  const city = cities.find((city) => city.code === cityCodeInRaw);

  expect(cityInTable).toBe(city?.name ?? "");
}
