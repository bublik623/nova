import { test, expect } from "@playwright/test";
import { ExperienceTranslationPage } from "../experience-translation.fixture";
import mockApi from "../experience-translation.mocks";

let translationPage: ExperienceTranslationPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/experience/experience-1/translation/es/settings");
  translationPage = new ExperienceTranslationPage(p);
});

test("the user should be able to see al the fields and values", async () => {
  const fieldLocators = {
    editorialTitleInput: translationPage.findByTestId("editorial-title-input-input-text-readonly"),
    translationTitleInput: translationPage.findById("translation-title-input"),
    editorialSeoTitleInput: translationPage.findByTestId("editorial-seo-title-input-input-text-readonly"),
    translationSeoTitleInput: translationPage.findById("translation-seo-title-input"),
  };

  const errorLocators = {
    translationTitleInputError: translationPage.findByTestId("translation-title-input-input-text-error"),
    translationSeoTitleInputError: translationPage.findByTestId("translation-seo-title-input-input-text-error"),
  };

  const { editorialTitleInput, translationTitleInput } = fieldLocators;
  const { translationSeoTitleInputError, translationTitleInputError } = errorLocators;

  await test.step("the form should be rendered correctly", async () => {
    await translationPage.goToNextSection.toBeEnabled();

    const fieldsVisiblePromise = Object.entries(fieldLocators).map(async ([, locator]) => await locator.isVisible());
    const fieldsVisible = await Promise.all(fieldsVisiblePromise);
    fieldsVisible.forEach((fieldVisible) => expect(fieldVisible).toBe(true));

    expect(await editorialTitleInput.innerText()).toBe("TestEnglish title");
    expect(await translationTitleInput.inputValue()).toBe("Spanish title");
    expect(await translationSeoTitleInputError.isVisible()).toBe(false);
    expect(await translationTitleInputError.isVisible()).toBe(false);
  });

  await test.step("it should show validation errors", async () => {
    await translationTitleInput.clear();
    await translationTitleInput.type("!");

    // Await the validation.
    // WORKAROUND until we can set the validation timeout to zero via env vars, like the autosave
    await translationPage.page.waitForTimeout(300);

    // Right now if you touch one field, all the fields get validated.
    expect(await translationTitleInputError.isVisible()).toBe(true);
    expect(await translationSeoTitleInputError.isVisible()).toBe(true);
  });

  await test.step("Translations settings diff", async () => {
    await test.step("Diff title", async () => {
      const fieldTitle = translationPage.findByTestId("editorial-title-input-input-text-readonly");
      const firstAddedText = await fieldTitle.locator(".green").nth(0).textContent();
      const secondAddedText = await fieldTitle.locator(".green").nth(1).textContent();
      const removedText = await fieldTitle.locator(".red").textContent();

      expect(firstAddedText).toContain("English");
      expect(secondAddedText).toContain("title");
      expect(removedText).toContain("Test");
    });

    await test.step("Diff seo-title", async () => {
      const fieldTitle = translationPage.findByTestId("editorial-seo-title-input-input-text-readonly");
      const addedText = await fieldTitle.locator(".green").textContent();
      const removedText = await fieldTitle.locator(".red").textContent();

      expect(addedText).toContain("English");
      expect(removedText).toContain("SEO test title ");
    });
  });
});
