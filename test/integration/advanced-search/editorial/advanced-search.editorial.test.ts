import { test, expect } from "@playwright/test";
import mockApi from "./advanced-search.editorial.mocks";
import {
  editorialSearchHitsWithDefaultLanguageFilterAndNoQuery as editorialSearchHitsWithDefaultLanguageFilterAndNoQuery,
  editorialSearchHitsWithQuery,
  editorialResultsWithFilters,
  suppliers,
  cities,
  reportFileContent,
  reportFileName,
} from "./advanced-search.editorial.data";
import { Supplier } from "@/types/generated/ContractMasterDataApi";
import { City } from "@/types/generated/GeoMasterDataApi";
import { AdvancedSearchEditorialPage, RowData, TranslationRowData } from "./advanced-search.editorial.fixture";
import { TypedDistributionContentSearchHit } from "@/features/advanced-search/types/seach-hit-overrides";
import { mockRemoteFeatureFlag, waitForFeatureFlagsRefresh } from "../../utils/mockRemoteFeatureFlag";
import { integrationBaseURL } from "@/playwright.config";

const baseURL = integrationBaseURL;

test.describe("advanced search editorial page", () => {
  let advancedSearchEditorialPage: AdvancedSearchEditorialPage;

  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await mockRemoteFeatureFlag(page, { editorial_adv_search_export_enabled: true });

    await page.goto("/advanced-search/editorial");

    await waitForFeatureFlagsRefresh(page);

    advancedSearchEditorialPage = new AdvancedSearchEditorialPage(page);
    await advancedSearchEditorialPage.waitForDataToLoad();
  });

  test("should display the editorial content after load", async () => {
    const tableData = await advancedSearchEditorialPage.getTableData();
    expectMatch(tableData, editorialSearchHitsWithDefaultLanguageFilterAndNoQuery, suppliers);
  });

  test("should navigate to experience detail page when title is clicked", async ({ page }) => {
    await advancedSearchEditorialPage.clickOnTitleOfFirstRow();

    const enContent = editorialSearchHitsWithQuery[0].content.experience_content?.find(
      (content) => content.language_code === "en"
    );
    await expect(page).toHaveURL(`${baseURL}/experience/${enContent?.experience_id}/curation/settings`);
  });

  test("should expand translation list when translation toggle is clicked", async () => {
    const translationDataBeforeToggleClicked = await advancedSearchEditorialPage.getTranslationsData();
    await advancedSearchEditorialPage.clickOnTranslationToggleOfFirstRow();
    const translationDataAfterToggleClicked = await advancedSearchEditorialPage.getTranslationsData();

    expect(translationDataBeforeToggleClicked.length).toBe(0);
    expectTranslationsMatch(
      translationDataAfterToggleClicked,
      editorialSearchHitsWithDefaultLanguageFilterAndNoQuery[0]
    );
  });

  test("should navigate to translation setting for the language when title of a translation is clicked", async ({
    page,
  }) => {
    await advancedSearchEditorialPage.clickOnTranslationToggleOfFirstRow();
    await advancedSearchEditorialPage.clickOnTitleOfFirstTranslation();

    const firstNonEnglishContent =
      editorialSearchHitsWithDefaultLanguageFilterAndNoQuery[0].content.experience_content?.filter(
        (content) => content.language_code !== "en"
      )[0];

    const expectedExperienceId = firstNonEnglishContent?.experience_id;
    const expectedLanguageCode = firstNonEnglishContent?.language_code;

    await expect(page).toHaveURL(
      `${baseURL}/experience/${expectedExperienceId}/translation/${expectedLanguageCode}/settings`
    );
  });

  test("should sort results after clicking on a column header", async ({ page }) => {
    await test.step("sort by id in ascending order", async () => {
      await advancedSearchEditorialPage.clickOnRefCodeColumnHeader();
      await expect(page).toHaveURL(/sort-key=reference_code&sort-direction=asc/);
    });

    await test.step("sort by id in descending order", async () => {
      await advancedSearchEditorialPage.clickOnRefCodeColumnHeader();
      await expect(page).toHaveURL(/sort-key=reference_code&sort-direction=desc/);
    });
  });

  test("should search editorial content when search button is clicked and display the matches in the title column", async ({
    page,
  }) => {
    const query = "a-search-query";

    await test.step("search", async () => {
      await advancedSearchEditorialPage.setQuery(query);
      await advancedSearchEditorialPage.clickSearchButton();

      await expect(page).toHaveURL(/query=a-search-query/);
    });

    await test.step("explore the results (parent level)", async () => {
      const tableData = await advancedSearchEditorialPage.getTableData();
      expectMatch(tableData, editorialSearchHitsWithQuery, suppliers);
    });

    await test.step("explore the results (child level)", async () => {
      await advancedSearchEditorialPage.clickOnTranslationToggleOfFirstRow();
      const translationDataAfterToggleClicked = await advancedSearchEditorialPage.getTranslationsData();
      expectTranslationsMatch(translationDataAfterToggleClicked, editorialSearchHitsWithQuery[0]);
    });
  });

  test("should allow to apply and clear filters", async () => {
    await advancedSearchEditorialPage.clickOnPageNumber(1);
    await test.step("apply filters", async () => {
      await advancedSearchEditorialPage.setPublicationDateFilter(4, 10);
      await advancedSearchEditorialPage.clickOnApplyFilters();
    });

    await test.step("explore the results", async () => {
      const tableData = await advancedSearchEditorialPage.getTableData();
      expectMatch(tableData, editorialResultsWithFilters, suppliers);
    });

    await test.step("clear filters", async () => {
      await advancedSearchEditorialPage.clickOnClearFilters();
    });
  });

  test("should navigate to advanced search raw page when the toggle is clicked", async ({ page }) => {
    await advancedSearchEditorialPage.clickOnEditorialToggle();
    await expect(page).toHaveURL(/\/advanced-search\/raw/);
  });

  test("the pagination should work as expected", async ({ page }) => {
    await advancedSearchEditorialPage.clickOnPageNumber(5);
    await page.waitForSelector("text=1-ref_code-p-5");
    await page.waitForSelector("text=common.showing 201 common.to 250 common.of 1000 common.entries");

    await advancedSearchEditorialPage.clickOnPageNumber(20);
    await page.waitForSelector("text=1-ref_code-p-20");
    await page.waitForSelector("text=common.showing 951 common.to 1000 common.of 1000 common.entries");
  });

  test("should allow downloading the search results as excel file", async () => {
    const exportDownloadPromise = advancedSearchEditorialPage.exportDownload();
    await advancedSearchEditorialPage.clickExportButton();
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

function expectMatch(
  tableData: RowData[],
  editorialSearchHits: TypedDistributionContentSearchHit[],
  suppliers: Supplier[]
) {
  expect(tableData.length).toBe(editorialSearchHits.length);
  for (let i = 0; i < tableData.length; i++) {
    const tableDataRow = tableData[i];
    const editorialSearchHit = editorialSearchHits[i];
    const editorialSearchHitEnContent = editorialSearchHit.content.experience_content?.find(
      (content) => content.language_code === "en"
    );
    const editorialSearchHitOtherLanguagesContent =
      editorialSearchHit.content.experience_content?.filter((content) => content.language_code !== "en") ?? [];
    expect(tableDataRow.hasTranslations).toBe((editorialSearchHitOtherLanguagesContent.length ?? 0) > 0);
    expectTitleMatch(tableDataRow, "en", editorialSearchHit);
    expect(tableDataRow.refCode).toBe(editorialSearchHit.content.reference_code);
    expect(tableDataRow.status).toBe("draft");
    expectDateMatch(tableDataRow.lastModified, editorialSearchHitEnContent?.experience_translation?.updated_date ?? "");
    expectSupplierMatch(tableDataRow.supplier, editorialSearchHit.content.supplier_id, suppliers);
    expectCityMatch(
      tableDataRow.city,
      editorialSearchHit.content.functional_content?.experience_location?.address.city ?? "",
      cities
    );
    expect(tableDataRow.country).toBe(
      editorialSearchHit.content.functional_content?.experience_location?.address.country ?? ""
    );
    expectDateMatch(tableDataRow.published, editorialSearchHit.content.experience_media?.distribution_date ?? "");
    expectDateMatch(tableDataRow.created, editorialSearchHitEnContent?.experience_translation?.creation_date ?? "");
  }
}

function expectTranslationsMatch(
  translationsData: TranslationRowData[],
  editorialSearchHit: TypedDistributionContentSearchHit
) {
  const editorialSearchHitOtherLanguagesContent =
    editorialSearchHit.content.experience_content?.filter((content) => content.language_code !== "en") ?? [];

  expect(translationsData.length).toBe(editorialSearchHitOtherLanguagesContent.length);
  for (let i = 0; i < translationsData.length; i++) {
    const translationDataRow = translationsData[i];
    const editorialSearchHitContent = editorialSearchHitOtherLanguagesContent[i];

    expect(translationDataRow.flagIconAlt).toBe(editorialSearchHitContent.language_code.toLocaleLowerCase());
    expect(translationDataRow.languageCode).toBe(editorialSearchHitContent.language_code.toLocaleUpperCase());
    expectTranslationTitleMatch(translationDataRow, editorialSearchHitContent.language_code, editorialSearchHit);
    expect(translationDataRow.status).toBe("draft");
  }
}

function expectTitleMatch(
  rowData: RowData,
  languageCode: string,
  editorialSearchHit: TypedDistributionContentSearchHit
) {
  const titleKey = "experience_content.experience_translation.title";
  const matchHighlights = editorialSearchHit.highlight_fields;

  if ((matchHighlights?.[languageCode]?.[titleKey]?.length ?? 0) > 0) {
    expect(rowData.titleHighlightHTML).toBe(matchHighlights?.[languageCode]?.[titleKey]?.[0]);
  } else {
    expect(rowData.title).toBe(
      editorialSearchHit.content.experience_content?.find((content) => content.language_code === languageCode)
        ?.experience_translation?.title
    );
  }
}

function expectTranslationTitleMatch(
  translationRowData: TranslationRowData,
  languageCode: string,
  editorialSearchHit: TypedDistributionContentSearchHit
) {
  const titleKey = "experience_content.experience_translation.title";
  const matchHighlights = editorialSearchHit.highlight_fields;

  if ((matchHighlights?.[languageCode]?.[titleKey]?.length ?? 0) > 0) {
    expect(translationRowData.titleTranslationHighlightHTML).toBe(matchHighlights?.[languageCode]?.[titleKey]?.[0]);
  } else {
    expect(translationRowData.titleTranslation).toBe(
      editorialSearchHit.content.experience_content?.find((content) => content.language_code === languageCode)
        ?.experience_translation?.title
    );
  }
}

function expectDateMatch(dateInTable: string, dateInEditorial: string) {
  expect(dateInTable).toBe(convertDateInExpectedFormat(dateInEditorial));
}

function convertDateInExpectedFormat(dateInEditorial: string) {
  return dateInEditorial.length === 0 ? "" : new Intl.DateTimeFormat("en-gb").format(new Date(dateInEditorial));
}

function expectSupplierMatch(
  supplierInTable: string,
  supplierIdInEditorial: string | undefined,
  suppliers: Supplier[]
) {
  const supplier = suppliers.find((supplier) => supplier.id === supplierIdInEditorial);

  expect(supplierInTable).toBe(supplier?.name ?? "");
}

function expectCityMatch(cityInTable: string, cityCodeInEditorial: string, cities: City[]) {
  const city = cities.find((city) => city.code === cityCodeInEditorial);

  expect(cityInTable).toBe(city?.name ?? "");
}
