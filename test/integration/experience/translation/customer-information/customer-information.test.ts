import { test, expect } from "@playwright/test";
import { ExperienceTranslationPage } from "../experience-translation.fixture";
import mockApi from "../experience-translation.mocks";

let translationPage: ExperienceTranslationPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/experience/experience-1/translation/es/customer-information");
  translationPage = new ExperienceTranslationPage(p);

  await translationPage.page.waitForSelector('[data-testid="experience-translation-customer-information"]');
});

test("the user should be able to see al the fields and values", async () => {
  const fieldLocators = {
    editorialVoucher: translationPage.findById("editorial-info-voucher"),
    translationVoucher: translationPage.findById("translation-info-voucher"),
  };

  const { editorialVoucher, translationVoucher } = fieldLocators;

  await test.step("the form should be rendered correctly", async () => {
    const fieldsVisiblePromises = Object.entries(fieldLocators).map(async ([, locator]) => await locator.isVisible());
    const fieldsVisible = await Promise.all(fieldsVisiblePromises);
    fieldsVisible.forEach((fieldVisible) => expect(fieldVisible).toBe(true));

    await expect(editorialVoucher).toContainText("English voucher");
    await expect(translationVoucher).toContainText("Spanish voucher");
  });

  await test.step("Customer-information diff", async () => {
    await test.step("Diff info voucher", async () => {
      const fieldInfoVoucher = translationPage.findById("editorial-info-voucher");
      expect(fieldInfoVoucher.locator("diff-html").isVisible()).toBeTruthy();
      expect(await fieldInfoVoucher.locator("ins").textContent()).toContain("English voucher");
      expect(await fieldInfoVoucher.locator("del").textContent()).toContain("test");
    });
  });
});
