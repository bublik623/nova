import { test, expect } from "@playwright/test";
import { ExperienceTranslationPage } from "./experience-translation.fixture";
import mockApi from "./experience-translation.mocks";
import { integrationBaseURL } from "@/playwright.config";

let translationPage: ExperienceTranslationPage;

test.beforeEach(async ({ page: p }) => {
  await mockApi(p);

  await p.goto("/experience/experience-1/translation/es/settings");
  translationPage = new ExperienceTranslationPage(p);
});

test("Translation right action bar", async () => {
  await test.step("the user can navigate to the version history", async () => {
    await translationPage.page.getByTestId("document-action-bar-history-btn").click();
    await translationPage.page.getByTestId("product-history-toggle").click();
    await translationPage.page
      .getByTestId("document-action-bar-content")
      .getByText("experience.flow_code.MANUAL_TRANSLATION")
      .click();
  });

  await test.step("the user can open a revision", async () => {
    await translationPage.page.getByTestId("document-action-bar-history-btn").click();
    await translationPage.page.getByTestId("version-card-action-view").click();

    await expect(translationPage.page).toHaveURL(
      `${integrationBaseURL}/experience/experience-1/revision/test-id-en-2/translation/es/settings`
    );
  });
});

test("the user should be able to see al the fields and values", async () => {
  await test.step("the left bar should be rendered correctly", async () => {
    expect(await translationPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");
    expect(await translationPage.page.getByTestId("sidebar-section-button").count()).toBe(4);
  });

  await test.step("the right action bar should be rendered correctly", async () => {
    expect(await translationPage.findByTestId("document-action-bar").isVisible()).toBe(true);

    await translationPage.goToNextSection.toBeVisible();
  });

  await test.step("the master page should be rendered correctly", async () => {
    // check that the page wrapper is present
    expect(await translationPage.findByTestId("nova-experience-translation-experience-1-es").isVisible()).toBe(true);

    // check that the tabs are present
    expect(await translationPage.findByTestId("document-tab-navigation").isVisible()).toBe(true);
  });
});

// We cannot test the full flow right now
test.skip("the user should be able to publish", async () => {
  // check the status
  expect(await translationPage.findByTestId("document-sidebar-label").innerText()).toBe(
    "status.flow.manual_translation -\nstatus.code.to_be_edit"
  );

  // Publish
  expect(await translationPage.findByTestId("document-action-bar-send-to-preview").isDisabled()).toBeTruthy();

  await translationPage.findByTestId("translation-seo-title-input-input-text").fill("seo meta title");

  await translationPage.findByTestId("document-action-bar-send-to-preview").click();

  // Check notification
  expect(await translationPage.findByTestId("nova-toast").nth(0).innerText()).toContain(
    "notifications.success.saving.single.translation"
  );

  // check the status
  expect(await translationPage.findByTestId("document-sidebar-label").innerText()).toBe(
    "status.flow.manual_translation -\nstatus.code.published"
  );
});
