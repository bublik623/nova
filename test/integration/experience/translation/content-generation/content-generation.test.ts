import { test, expect } from "@playwright/test";
import { ExperienceTranslationPage } from "../experience-translation.fixture";
import mockApi from "../experience-translation.mocks";

let translationPage: ExperienceTranslationPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/experience/experience-1/translation/es/content-generation");
  translationPage = new ExperienceTranslationPage(p);

  await translationPage.page.waitForSelector('[data-testid="experience-translation-content-generation"]');
});

test.skip("the user should be able to see al the fields and values", async () => {
  const { page } = translationPage;

  const fieldLocators = {
    editorialDescription: translationPage.findById("editorial-description"),
    translationDescription: translationPage.findById("translation-description"),
    editorialSeoDescription: translationPage.findById("editorial-seo-description"),
    translationSeoDescription: translationPage.findById("translation-seo-description"),
    editorialAdditionalDescription: translationPage.findById("editorial-additional-description"),
    translationAdditionalDescription: translationPage.findById("translation-additional-description"),
  };

  const {
    editorialDescription,
    translationDescription,
    editorialAdditionalDescription,
    editorialSeoDescription,
    translationAdditionalDescription,
    translationSeoDescription,
  } = fieldLocators;

  await test.step("the form should be rendered correctly", async () => {
    await translationPage.goToNextSection.toBeEnabled();

    const fieldsVisiblePromises = Object.entries(fieldLocators).map(async ([, locator]) => await locator.isVisible());
    const fieldsVisible = await Promise.all(fieldsVisiblePromises);
    fieldsVisible.forEach((fieldVisible) => expect(fieldVisible).toBe(true));

    await expect(editorialDescription).toContainText("English description");
    await expect(translationDescription).toContainText("Spanish description");

    await expect(editorialSeoDescription).toContainText("English seo description");
    await expect(translationSeoDescription).toContainText("Spanish seo description");

    await expect(editorialAdditionalDescription).toContainText("English additional description");
    await expect(translationAdditionalDescription).toContainText("Spanish additional description");
  });

  await test.step("the custom translations should display correctly", async () => {
    await page
      .getByTestId("translation-highlights")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .click();
    await page
      .getByTestId("translation-highlights")
      .getByTestId("462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7-input-text")
      .click();
    await page
      .getByTestId("translation-highlights")
      .getByTestId("46bf2812-4045-4dbf-8208-2726798ce9a8-input-text")
      .click();
    await page.getByText("Lunch menu to keep you going all the day").nth(1).click();
    await page.getByText("Entrance fees").nth(1).click();
    await page
      .getByTestId("translation-included")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .click();
    await page
      .getByTestId("translation-included")
      .getByTestId("462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7-input-text")
      .click();
    await page
      .getByTestId("translation-included")
      .getByTestId("46bf2812-4045-4dbf-8208-2726798ce9a8-input-text")
      .click();
    await page
      .getByTestId("translation-non_included")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .click();
    await page
      .getByTestId("translation-non_included")
      .getByTestId("462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7-input-text")
      .click();
    await page
      .getByTestId("translation-non_included")
      .getByTestId("46bf2812-4045-4dbf-8208-2726798ce9a8-input-text")
      .click();
    await page
      .getByTestId("translation-important_information")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .click();
    await page
      .getByTestId("translation-important_information")
      .getByTestId("462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7-input-text")
      .click();
    await page
      .getByTestId("translation-important_information")
      .getByTestId("46bf2812-4045-4dbf-8208-2726798ce9a8-input-text")
      .click();
    await page
      .getByTestId("translation-highlights")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .click();
    await page
      .getByTestId("translation-highlights")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .fill("Renamed!");
    await page
      .getByTestId("translation-highlights")
      .getByTestId("fde07d18-22d5-4b25-8699-56227c5abecb-input-text")
      .click();

    await translationPage.checkHighlightsRow("editorial-highlights", 1, "Rename!");
    await translationPage.checkHighlightsRow("editorial-highlights", 2, "testing auto save");
    await translationPage.checkHighlightsRow("editorial-highlights", 3, "Hey");

    await translationPage.checkHighlightsRow("editorial-included", 1, "Rename!");
    await translationPage.checkHighlightsRow("editorial-included", 2, "testing auto save");
    await translationPage.checkHighlightsRow("editorial-included", 3, "Hey");

    await translationPage.checkHighlightsRow("editorial-non_included", 1, "Rename!");
    await translationPage.checkHighlightsRow("editorial-non_included", 2, "testing auto save");
    await translationPage.checkHighlightsRow("editorial-non_included", 3, "Hey");

    await translationPage.checkHighlightsRow("editorial-important_information", 1, "Rename!");
    await translationPage.checkHighlightsRow("editorial-important_information", 2, "testing auto save");
    await translationPage.checkHighlightsRow("editorial-important_information", 3, "Hey");
  });

  await test.step("the premade highlights should display correctly", async () => {
    await page.getByTestId("editorial-highlights").getByText("Lunch menu to keep you going all the day").click();
    await page.getByTestId("translation-highlights").getByText("Lunch menu to keep you going all the day").click();
    await page.getByTestId("editorial-included").getByText("Entrance fees").click();
    await page.getByTestId("translation-included").getByText("Entrance fees").click();
    await page.getByTestId("editorial-non_included").getByText("Lunch").click();
    await page.getByTestId("translation-non_included").getByText("Lunch").click();
    await page.getByTestId("editorial-important_information").getByText("Copy of your password").click();
    await page.getByTestId("translation-important_information").getByText("Copy of your password").click();
  });

  await test.step("the premade visibility toggle should work correctly", async () => {
    await page.locator("#highlights").getByRole("switch").click();
    expect(
      await page
        .getByTestId("editorial-highlights")
        .getByRole("heading", { name: "experience.highlights.premade.title" })
        .isVisible()
    ).toBe(false);
  });

  await test.step("content-generation settings diff", async () => {
    await test.step("Diff title", async () => {
      const fieldAdditionalDescription = translationPage.findById("editorial-additional-description");
      expect(fieldAdditionalDescription.locator("diff-html").isVisible()).toBeTruthy();
      expect(await fieldAdditionalDescription.locator("ins").textContent()).toContain("English additional description");
      expect(await fieldAdditionalDescription.locator("del").textContent()).toContain("test");
    });
  });
});
