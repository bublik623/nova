import { test, expect } from "@playwright/test";
import { PriceSectionPage } from "./price.fixture";
import { mockMasterData } from "@/test/integration/utils/mockMasterData";
import { mockExperienceMasterData, mockPriceSectionEndpoints } from "./price.mocks";
import { mockOpinoiaExperienceId } from "./price.data";

const pageUrl = `/opinoia/${mockOpinoiaExperienceId}/operational/price`;

test.describe.parallel("Price section", () => {
  let po: PriceSectionPage;

  test.beforeEach(async ({ page }) => {
    // fixed date: 3 may 2025
    await page.clock.setFixedTime(new Date("2025-05-03"));

    await mockMasterData(page);
    await mockExperienceMasterData(page);
    // Note: page navigation moved to individual describe blocks
  });

  test.describe("with no initial data", () => {
    test.beforeEach(async ({ page }) => {
      // Mock with empty data BEFORE navigation
      await mockPriceSectionEndpoints(page, { internalPricings: [] });

      // Navigate after mocks are set up
      await page.goto(pageUrl);
      await page.waitForSelector("[data-testid='table-price']");
      po = new PriceSectionPage(page);
    });

    test("user interactions", async () => {
      await test.step("can see the table", async () => {
        await expect(po.table.element()).toBeVisible();

        await expect(po.table.optionHeader()).toBeVisible();
        await expect(po.table.dateRangeHeader()).toBeVisible();
        await expect(po.table.currencyHeader()).toBeVisible();
        await expect(po.table.languagesHeader()).toBeVisible();
        await expect(po.table.zonesHeader()).toBeVisible();
        await expect(po.table.daysHeader()).toBeVisible();

        await test.step("table should have no rows", async () => {
          await expect(po.table.element()).toBeVisible();
          await expect(po.rows).toHaveCount(0);
        });
      });

      await test.step("can add new line", async () => {
        await po.addNewPriceButton.click();
        const row = await po.getRow(0);

        await test.step("row should be visible", async () => {
          await expect(row.element()).toBeVisible();
        });

        await test.step("should have sub-row", async () => {
          const subRow = row.getSubRow(0);

          await test.step("sub-row should have headers", async () => {
            await expect(subRow.header.paxLabelHeader()).toBeVisible();
            await expect(subRow.header.costHeader()).toBeVisible();
            await expect(subRow.header.suggestedPriceHeader()).toBeVisible();
            await expect(subRow.header.initialPriceHeader()).toBeVisible();
          });

          await test.step("sub-row inputs should be disabled", async () => {
            await expect(subRow.paxLabel()).toHaveText("");
            await expect(subRow.costInput()).toBeDisabled();
            await expect(subRow.suggestedPriceInput()).toBeDisabled();
            await expect(subRow.initialPriceInput()).toBeDisabled();
          });
        });
      });

      await test.step("can configure a new price", async () => {
        const row = await po.getRow(0);

        await test.step("can select an option", async () => {
          const optionSelect = row.optionSelect();
          await optionSelect.open();
          await optionSelect.selectOption("mock-option-1-code");

          expect(await optionSelect.trigger().textContent()).toBe("mock-option-1-code");
        });

        await test.step("can select a date range", async () => {
          const dateRange = row.dateRange();
          await dateRange.open();
          await dateRange.selectDay(11);
          await dateRange.selectDay(18);

          expect(await dateRange.trigger().textContent()).toBe("11/05/2025 - 18/05/2025");
        });

        await test.step("can select a currency", async () => {
          const currencySelect = row.currencySelect();
          await currencySelect.open();
          await currencySelect.selectOption("EUR");

          expect(await currencySelect.trigger().textContent()).toBe("EUR");
        });

        await test.step("can select languages", async () => {
          const languagesSelect = row.languagesSelect();
          await languagesSelect.open();
          await languagesSelect.selectOption("common.language.en");
          await languagesSelect.selectOption("common.language.fr");

          expect(await languagesSelect.trigger().textContent()).toEqual("common.language.en, common.language.fr");
        });

        await test.step("can select days of week", async () => {
          const daysSelect = row.daysSelect();
          await daysSelect.open();
          await daysSelect.selectOption("common.monday");
          await daysSelect.selectOption("common.wednesday");

          expect(await daysSelect.trigger().textContent()).toEqual("common.monday, common.wednesday");
        });

        await test.step("can define price for pax type Adult (defined in the option)", async () => {
          const adultPaxTypeRow = row.getSubRow(0);
          await expect(adultPaxTypeRow.paxLabel()).toHaveText("Adult");

          await adultPaxTypeRow.costInput().fill("5");
          await adultPaxTypeRow.initialPriceInput().fill("6");
          await adultPaxTypeRow.suggestedPriceInput().fill("7");
        });

        await test.step("can define price for pax type Child (defined in the option)", async () => {
          const childPaxTypeRow = row.getSubRow(1);
          await expect(childPaxTypeRow.paxLabel()).toHaveText("Child");

          await childPaxTypeRow.costInput().fill("2");
          await childPaxTypeRow.initialPriceInput().fill("3");
          await childPaxTypeRow.suggestedPriceInput().fill("4");
        });
      });

      await test.step("can duplicate a line", async () => {
        const row = await po.getRow(0);
        await row.duplicateButton().click();

        const newRow = await po.getRow(1);
        await expect(newRow.element()).toBeVisible();

        // check that the new row is a duplicate of the original row
        // option
        expect(await newRow.optionSelect().trigger().textContent()).toBe(
          await row.optionSelect().trigger().textContent()
        );
        // date range
        expect(await newRow.dateRange().trigger().textContent()).toBe(await row.dateRange().trigger().textContent());
        // currency
        expect(await newRow.currencySelect().trigger().textContent()).toBe(
          await row.currencySelect().trigger().textContent()
        );
        // languages
        expect(await newRow.languagesSelect().trigger().textContent()).toBe(
          await row.languagesSelect().trigger().textContent()
        );
        // days of week
        expect(await newRow.daysSelect().trigger().textContent()).toBe(await row.daysSelect().trigger().textContent());
      });

      await test.step("can delete a line", async () => {
        const secondRow = await po.getRow(1);
        await secondRow.deleteButton().click();

        await expect(secondRow.element()).not.toBeAttached();
      });

      await test.step("can save changes", async () => {
        const postNewPricePromise = po.getPostPriceRequest();

        await po.saveButton.click();

        const postNewPriceRequest = await postNewPricePromise;
        const newPricePayload = postNewPriceRequest.postDataJSON();

        expect(newPricePayload).toEqual({
          currency: "EUR",
          date_from: "2025-05-11",
          date_to: "2025-05-18",
          days: ["MONDAY", "WEDNESDAY"],
          languages: ["en", "fr"],
          option_id: "mock-option-1",
          prices: [
            {
              cost: 5,
              initial: 6,
              pax: "adult",
              suggested: 7,
            },
            {
              cost: 2,
              initial: 3,
              pax: "child",
              suggested: 4,
            },
          ],
        });
      });
    });
  });

  test.describe("with initial data", () => {
    test.beforeEach(async ({ page }) => {
      await mockPriceSectionEndpoints(page);

      await page.goto(pageUrl);
      await page.waitForSelector("[data-testid='table-price']");
      po = new PriceSectionPage(page);
    });

    test("user", async () => {
      await test.step("can see the saved rows", async () => {
        await expect(po.rows).toHaveCount(2);

        // (mock-price-uuid-1)
        await test.step("row 1", async () => {
          const row1 = await po.getRow(0);
          await expect(row1.optionSelect().trigger()).toHaveText("mock-option-1-code");
          await expect(row1.dateRange().trigger()).toHaveText("05/05/2025 - 12/05/2025");
          await expect(row1.currencySelect().trigger()).toHaveText("EUR");
          await expect(row1.languagesSelect().trigger()).toHaveText("common.language.en");
          await expect(row1.daysSelect().trigger()).toHaveText("common.monday, common.tuesday");
          // sub-row Adult
          await expect(row1.getSubRow(0).paxLabel()).toHaveText("Adult");
          await expect(row1.getSubRow(0).costInput()).toHaveValue("20");
          await expect(row1.getSubRow(0).suggestedPriceInput()).toHaveValue("30");
          await expect(row1.getSubRow(0).initialPriceInput()).toHaveValue("10");
          // sub-row Child
          await expect(row1.getSubRow(1).paxLabel()).toHaveText("Child");
          await expect(row1.getSubRow(1).costInput()).toHaveValue("15");
          await expect(row1.getSubRow(1).suggestedPriceInput()).toHaveValue("25");
          await expect(row1.getSubRow(1).initialPriceInput()).toHaveValue("10");
        });

        // (mock-price-uuid-2)
        await test.step("row 2", async () => {
          const row2 = await po.getRow(1);
          await expect(row2.optionSelect().trigger()).toHaveText("mock-option-2-code");
          await expect(row2.dateRange().trigger()).toHaveText("10/05/2025 - 17/05/2025");
          await expect(row2.currencySelect().trigger()).toHaveText("EUR");
          await expect(row2.languagesSelect().trigger()).toHaveText("common.language.fr");
          await expect(row2.daysSelect().trigger()).toHaveText("common.wednesday");
          // sub-row Adult
          await expect(row2.getSubRow(0).paxLabel()).toHaveText("Adult");
          await expect(row2.getSubRow(0).costInput()).toHaveValue("25");
          await expect(row2.getSubRow(0).suggestedPriceInput()).toHaveValue("22");
          await expect(row2.getSubRow(0).initialPriceInput()).toHaveValue("20");
        });
      });
    });
  });

  test.describe("pax types", () => {
    test.beforeEach(async ({ page }) => {
      // Mock with empty data BEFORE navigation
      await mockPriceSectionEndpoints(page, { internalPricings: [] });

      // Navigate after mocks are set up
      await page.goto(pageUrl);
      await page.waitForSelector("[data-testid='table-price']");
      po = new PriceSectionPage(page);
    });

    test("should use experience paxes when option has no specific pax types", async () => {
      await test.step("add new price line", async () => {
        await po.addNewPriceButton.click();
        const row = await po.getRow(0);
        await expect(row.element()).toBeVisible();
      });

      await test.step("select option with no pax types (option 3)", async () => {
        const row = await po.getRow(0);
        const optionSelect = row.optionSelect();
        await optionSelect.open();
        await optionSelect.selectOption("mock-option-3-code");

        expect(await optionSelect.trigger().textContent()).toBe("mock-option-3-code");
      });

      await test.step("should show experience pax types (Adult and Child from experience paxes)", async () => {
        const row = await po.getRow(0);

        // Should have 2 pax rows from experience paxes (adult and child)
        const adultPaxTypeRow = row.getSubRow(0);
        await expect(adultPaxTypeRow.paxLabel()).toHaveText("Adult");
        await expect(adultPaxTypeRow.costInput()).toBeEnabled();
        await expect(adultPaxTypeRow.suggestedPriceInput()).toBeEnabled();
        await expect(adultPaxTypeRow.initialPriceInput()).toBeEnabled();

        const childPaxTypeRow = row.getSubRow(1);
        await expect(childPaxTypeRow.paxLabel()).toHaveText("Child");
        await expect(childPaxTypeRow.costInput()).toBeEnabled();
        await expect(childPaxTypeRow.suggestedPriceInput()).toBeEnabled();
        await expect(childPaxTypeRow.initialPriceInput()).toBeEnabled();
      });

      await test.step("can configure prices for experience pax types", async () => {
        const row = await po.getRow(0);

        // Configure adult pricing
        const adultPaxTypeRow = row.getSubRow(0);
        await adultPaxTypeRow.costInput().fill("10");
        await adultPaxTypeRow.initialPriceInput().fill("12");
        await adultPaxTypeRow.suggestedPriceInput().fill("15");

        // Configure child pricing
        const childPaxTypeRow = row.getSubRow(1);
        await childPaxTypeRow.costInput().fill("5");
        await childPaxTypeRow.initialPriceInput().fill("6");
        await childPaxTypeRow.suggestedPriceInput().fill("8");
      });

      await test.step("switch to option with specific pax types and back", async () => {
        const row = await po.getRow(0);

        // Switch to option 2 (has only adult pax)
        const optionSelect = row.optionSelect();
        await optionSelect.open();
        await optionSelect.selectOption("mock-option-2-code");

        // Should now only show adult pax type
        const adultPaxTypeRow = row.getSubRow(0);
        await expect(adultPaxTypeRow.paxLabel()).toHaveText("Adult");

        // Should not have a second pax row
        await expect(row.getSubRow(1).isVisible()).resolves.toBe(false);

        // Switch back to option 3 (no specific pax types)
        await optionSelect.open();
        await optionSelect.selectOption("mock-option-3-code");

        // Should show experience pax types again
        await expect(row.getSubRow(0).paxLabel()).toHaveText("Adult");
        await expect(row.getSubRow(1).paxLabel()).toHaveText("Child");
      });
    });
  });
});
