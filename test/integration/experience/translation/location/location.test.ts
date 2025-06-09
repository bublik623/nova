import { test, expect } from "@playwright/test";
import { ExperienceTranslationPage } from "../experience-translation.fixture";
import mockApi from "../experience-translation.mocks";

let translationPage: ExperienceTranslationPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/experience/experience-1/translation/es/location");
  translationPage = new ExperienceTranslationPage(p);

  await translationPage.page.waitForURL("/experience/experience-1/translation/es/location");
});

test("the user should be able to see all the fields and values", async () => {
  const fieldLocators = {
    editorialVoucher: translationPage.findById("editorial-meeting-point"),
    translationVoucher: translationPage.findById("translation-meeting-point"),
  };

  const { editorialVoucher, translationVoucher } = fieldLocators;

  await test.step("the form should be rendered correctly", async () => {
    await translationPage.goToNextSection.toBeEnabled();

    const fieldsVisiblePromises = Object.entries(fieldLocators).map(async ([, locator]) => await locator.isVisible());
    const fieldsVisible = await Promise.all(fieldsVisiblePromises);
    fieldsVisible.forEach((fieldVisible) => expect(fieldVisible).toBe(true));

    await expect(editorialVoucher).toContainText("test English");
    await expect(translationVoucher).toContainText("Spanish meeting details");
  });
  await test.step("Location settings diff", async () => {
    await test.step("Diff meeting point", async () => {
      const fieldMeetingPoint = translationPage.findById("editorial-meeting-point");
      expect(fieldMeetingPoint.locator("diff-html").isVisible()).toBeTruthy();
      expect(await fieldMeetingPoint.locator("ins").textContent()).toContain("English");
      expect(await fieldMeetingPoint.locator("del").textContent()).toContain("test");
    });
  });
});
