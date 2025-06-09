import { test, expect } from "@playwright/test";
import { editorialContent } from "../experience-curation.data";
import mockApi from "../experience-curation.mocks";
import { FieldSupplierComponent } from "../../raw/settings/settings.fixture";
import { ExperienceCurationPage } from "@/test/integration/experience/curation/experience-curation.fixture";

let curationPage: ExperienceCurationPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/curation/settings");

  curationPage = new ExperienceCurationPage(page);
});

test("Curation settings page", async ({ page }) => {
  await test.step("the main form should be displayed correctly", async () => {
    const fields = [
      "raw-title-input-text-readonly",
      "editorial-title-input-text",
      "seo-title-input-text",
      "experience-category",
      "product-brand-options",
      "promotional-options-options",
      "own-offer-options",
      "external_reference_code-input-text-readonly",
    ];

    for await (const field of fields) {
      await expect(curationPage.findByTestId(field)).toBeVisible();
    }

    expect(await curationPage.findByTestId("raw-title-input-text-readonly").innerText()).toContain(
      "Deleniti inventore nihil ut ipsum modi cupiditate iusto"
    );

    await curationPage.checkField("editorial-title-input-text", editorialContent.title);

    await curationPage.checkField("seo-title-input-text", editorialContent.seo_title ?? "");

    // check category field
    const categoryField = curationPage.findByTestId("experience-category");

    await expect(categoryField.locator("p").nth(0)).toHaveText("Activities");
    await expect(categoryField.locator("p").nth(1)).toHaveText("Air activities, Food & drink");

    await test.step("if the user select national geographic as product brand, the tours levels field should appear", async () => {
      await curationPage.selectNatGeoBrand();

      expect(await curationPage.findByTestId("nat-geo-options").isVisible()).toBe(true);
    });

    await test.step("supplier name field should not be visible in curation", async () => {
      const fieldSupplier = new FieldSupplierComponent({ page, fieldTestId: "curation-supplier-name-input-text" });

      //check that edit button in supplier field is not visible
      await expect(fieldSupplier.findEditButton()).not.toBeVisible();

      // check selected supplier
      expect(await fieldSupplier.selectedSupplierId()).toBe("test-supplier-id");
    });
  });

  await test.step("Diff", async () => {
    await test.step("Diff title", async () => {
      const fieldTitle = curationPage.findByTestId("raw-title-input-text-readonly");

      const addedText = await fieldTitle.locator(".green").textContent();
      const removedText = await fieldTitle.locator(".red").textContent();

      expect(addedText).toContain("non");
      expect(removedText).toContain("text should be removed");
    });
  });
});

test("The view type filters the fields correctly", async () => {
  await curationPage.filterByCommercialViewType();
  await expect(curationPage.formSection).toHaveCount(2);
  await expect(curationPage.getSidebarSectionItems).toHaveCount(2);

  await curationPage.filterByAllViewType();
  await expect(curationPage.formSection).toHaveCount(8);
  await expect(curationPage.getSidebarSectionItems).toHaveCount(8);
});
