import { test, expect } from "@playwright/test";
import mockApi from "./asterix-integration.mocks";
const pageUrl = "/experience/test-id/curation/asterix-integration";
import {
  asterixModalities,
  asterixServices,
  modalitiesTranslations,
  serviceCodeTranslations,
} from "./asterix-integration.data";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto(pageUrl);
});

test("the user can see the service and modalities form", async ({ page }) => {
  // check title editor components exists
  const serviceAndModalitiesTitlesEditor = page.getByTestId("service-and-modalities-title-editor");

  await expect(serviceAndModalitiesTitlesEditor).toHaveCount(1);

  const serviceTitleEditor = serviceAndModalitiesTitlesEditor.getByTestId(
    `service-title-editor-${serviceCodeTranslations[0].code}`
  );
  const serviceTitleReference = serviceTitleEditor.getByTestId("reference-value");
  const serviceTitleInput = serviceTitleEditor.locator("input");
  const modalityTitleEditor = serviceAndModalitiesTitlesEditor.getByTestId(
    `modality-title-editor-${modalitiesTranslations[0].asx_modality_code}`
  );
  const modalityTitleReference = modalityTitleEditor.getByTestId("reference-value");
  const modalityTitleInput = modalityTitleEditor.locator("input");

  await expect(serviceTitleReference).toContainText(asterixServices[0].default_name!);
  await expect(serviceTitleInput).toHaveValue(serviceCodeTranslations[0].name);

  await expect(modalityTitleReference).toContainText(asterixModalities[0].default_name!);
  await expect(modalityTitleInput).toHaveValue(modalitiesTranslations[0].name);
});

test("save button is disabled if a title is empty", async ({ page }) => {
  const serviceAndModalitiesTitlesEditor = page.getByTestId("service-and-modalities-title-editor");

  await expect(serviceAndModalitiesTitlesEditor).toHaveCount(1);

  const serviceTitleEditor = serviceAndModalitiesTitlesEditor.getByTestId(
    `service-title-editor-${serviceCodeTranslations[0].code}`
  );
  const serviceTitleEditorInput = serviceTitleEditor.locator("input");

  const modalityTitleEditor = serviceAndModalitiesTitlesEditor.getByTestId(
    `modality-title-editor-${modalitiesTranslations[0].asx_modality_code}`
  );
  const modalityTitleEditorInput = modalityTitleEditor.locator("input");

  const saveDraftBtn = page.getByTestId("document-action-bar-save-content");

  await test.step("service title empty", async () => {
    await serviceTitleEditorInput.clear();
    await expect(saveDraftBtn).toBeDisabled();

    await serviceTitleEditorInput.fill("a title");
    await expect(saveDraftBtn).not.toBeDisabled();
  });

  await test.step("modality title empty", async () => {
    await modalityTitleEditorInput.clear();
    await expect(saveDraftBtn).toBeDisabled();

    await modalityTitleEditorInput.fill("a title");
    await expect(saveDraftBtn).not.toBeDisabled();
  });
});
