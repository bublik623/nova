import { expect, test } from "@playwright/test";
import { editorialContent } from "../experience-curation.data";
import { ExperienceCurationPage } from "../experience-curation.fixture";
import mockApi from "../experience-curation.mocks";

let curationPage: ExperienceCurationPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/experience-1/curation/content-generation");

  curationPage = new ExperienceCurationPage(page);
});

test("Curation content generation", async ({ page }) => {
  await test.step("the descriptions should display correctly", async () => {
    // check text editors
    await curationPage.checkTextEditor(
      "raw-description",
      "removed text connecting the interface won't do anything",
      true
    );
    await curationPage.checkTextEditor(
      "raw-additional-description",
      "removed text connecting the interface won't do anything",
      true
    );
    await curationPage.checkTextEditor("editorial-description", editorialContent.text1);
    await curationPage.checkTextEditor("editorial-seo-description", editorialContent.seo_description ?? "");
    await curationPage.checkTextEditor("editorial-additional-description", editorialContent.text2 ?? "");
  });

  await test.step("the premade highlights should display correctly", async () => {
    await page.getByTestId("curation-highlights").getByText("Lunch menu to keep you going all the day").click();
    await page.getByTestId("curation-highlights").getByText("Dinner menu to keep you well-fed and happy").click();
    await page.getByTestId("curation-included").getByText("Entrance fees").click();
    await page.getByTestId("curation-included").getByText("Drinks").click();
    await page.getByTestId("curation-non_included").getByText("Entrance fees").click();
    await page.getByTestId("curation-non_included").getByText("2. Drinks").click();
    await page.getByTestId("curation-important_information").getByText("Copy of your password").click();
    await page
      .getByTestId("curation-important_information")
      .getByText("We recommend you wear comfortable shoes")
      .click();
    await page.getByTestId("raw-highlights").getByText("Lunch menu to keep you going all the day").click();
    await page.getByTestId("raw-highlights").getByText("Dinner menu to keep you well-fed and happy").click();
    await page.getByTestId("raw-included").getByText("Entrance fees").click();
    await page.getByTestId("raw-included").getByText("Drinks").click();
    await page.getByTestId("raw-non_included").getByText("Entrance fees").click();
    await page.getByTestId("raw-non_included").getByText("Drinks").click();
    await page.getByTestId("raw-important_information").getByText("Copy of your password").click();
    await page.getByTestId("raw-important_information").getByText("We recommend you wear comfortable shoes").click();

    // Add a premade highlight
    await page.getByTestId("curation-highlights").getByTestId("highlight-manager-premade-list-open-modal").click();
    await page.getByTestId("nova-collapse-header").first().click();
    await page.getByText("Includes a tasty breakfast to help you start the day right").click();
    await page.getByTestId("premade-modal-save").click();
    await page.getByText("3. Includes a tasty breakfast to help you start the day right").click();
  });

  await test.step("diff for highlights", async () => {
    await test.step("added premade highlights should be displayed correctly", async () => {
      const premadeHighlight = await page.getByTestId("raw-highlights").getByText("Added For Diff Premade");
      const classList = await premadeHighlight.getAttribute("class");
      const isAddedClassExist = classList?.includes("added");

      expect(isAddedClassExist).toBeTruthy();
    });

    await test.step("removed premade highlights should be displayed correctly", async () => {
      const premadeHighlight = await page.getByTestId("raw-highlights").getByText("Added For Testing Removed Premade");
      const classList = await premadeHighlight.getAttribute("class");
      const isRemovedClassExist = classList?.includes("removed");

      expect(isRemovedClassExist).toBeTruthy();
    });

    await test.step("added custom highlights should be displayed correctly", async () => {
      const customHighlight = await page.getByTestId("raw-highlights").getByText("custom diff 1");
      const classList = await customHighlight.getAttribute("class");
      const isAddedClassExist = classList?.includes("added");

      expect(isAddedClassExist).toBeTruthy();
    });

    await test.step("removed custom highlights should be displayed correctly", async () => {
      const customHighlight = await page.getByTestId("raw-highlights").getByText("My custom highlight 1");
      const classList = await customHighlight.getAttribute("class");
      const isRemovedClassExist = classList?.includes("removed");

      expect(isRemovedClassExist).toBeTruthy();
    });
  });

  await test.step("diff inputs", async () => {
    await test.step("diff description", async () => {
      const fieldDescription = page.getByTestId("raw-description");

      expect(fieldDescription.locator("diff-html").isVisible()).toBeTruthy();
      expect(await fieldDescription.locator("ins").textContent()).toContain("won't do anything");
      expect(await fieldDescription.locator("del").textContent()).toContain("removed text");
    });

    await test.step("diff additional description", async () => {
      const fieldAdditionalDescription = page.getByTestId("raw-additional-description");

      expect(fieldAdditionalDescription.locator("diff-html").isVisible()).toBeTruthy();
      expect(await fieldAdditionalDescription.locator("ins").textContent()).toContain("won't do anything");
      expect(await fieldAdditionalDescription.locator("del").textContent()).toContain("removed text");
    });
  });

  await test.step("the custom highlights should display correctly", async () => {
    await page.getByTestId("raw-highlights").getByText("My custom highlight 1").click();
    await page.getByTestId("raw-highlights").getByText("1. My custom highlight 1").click();
    await page.getByTestId("raw-highlights").getByText("2. My custom highlight 2").click();
    await page.getByTestId("curation-highlights").getByText("1. My custom highlight 1common.edit").click();
    await page.getByTestId("curation-highlights").getByText("2. My custom highlight 2common.edit").click();
    await page.getByTestId("curation-included").getByText("1. My custom highlight 1common.edit").click();
    await page.getByTestId("curation-included").getByText("2. My custom highlight 2common.edit").click();
    await page.getByTestId("raw-included").getByText("1. My custom highlight 1").click();
    await page.getByTestId("raw-included").getByText("2. My custom highlight 2").click();
    await page.getByTestId("raw-non_included").getByText("1. My custom highlight 1").click();
    await page.getByTestId("raw-non_included").getByText("2. My custom highlight 2").click();
    await page.getByTestId("curation-non_included").getByText("1. My custom highlight 1common.edit").click();
    await page.getByTestId("curation-non_included").getByText("2. My custom highlight 2common.edit").click();
    await page.getByTestId("raw-important_information").getByText("1. My custom highlight 1").click();
    await page.getByTestId("raw-important_information").getByText("2. My custom highlight 2").click();
    await page.getByTestId("curation-important_information").getByText("1. My custom highlight 1common.edit").click();
    await page.getByTestId("curation-important_information").getByText("2. My custom highlight 2common.edit").click();

    // Create a new highlight
    await page.getByTestId("curation-highlights").getByTestId("newValue-input-text").fill("create");
    await page
      .getByTestId("curation-highlights")
      .getByTestId("raw-highlights-new-highlight")
      .getByTestId("custom-highlights-add-new")
      .click();
    await page.getByText("3. createcommon.edit").click();

    // Edit an highlight
    await page
      .getByRole("listitem")
      .filter({ hasText: "3. createcommon.edit" })
      .getByTestId("highlights-manager-list-item-edit")
      .click();
    await page
      .getByTestId("curation-highlights")
      .getByTestId("raw-highlights-editable-custom-list")
      .getByTestId("newValue-input-text")
      .click({
        clickCount: 3,
      });
    await page
      .getByTestId("curation-highlights")
      .getByTestId("raw-highlights-editable-custom-list")
      .getByTestId("newValue-input-text")
      .fill("edit");
    await page.getByRole("button", { name: "common.save" }).click();
    await page.getByText("3. editcommon.edit").click();

    // Delete an highlight

    await page
      .getByRole("listitem")
      .filter({ hasText: "3. editcommon.edit" })
      .getByTestId("highlights-manager-list-item-delete")
      .click();

    await expect(await page.getByRole("listitem").filter({ hasText: "3. editcommon.edit" })).not.toBeVisible();
  });

  await test.step("functional group items displayed correctly (features, duration)", async () => {
    // check all the fields are displayed correctly
    await curationPage.checkFeatures(["Global account", "Hotel pick-up", "Instant confirmation"]);
  });

  await test.step("check the duration displays the correct data", async () => {
    const additionalServices = ["Up to 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", ">12 hours", "Overnight"];
    await curationPage.checkAdditionalServices(additionalServices);
  });
});

test("The view type filters the fields correclty", async ({ page }) => {
  await page.getByTestId("view-select-button").click();

  await page.getByTestId("options-list-list-item-commercial").getByText("experience.curation.view-type").click();
  expect(await curationPage.formSection.count()).toBe(7);
  expect(await curationPage.getSidebarSectionItems.count()).toBe(7);
});
