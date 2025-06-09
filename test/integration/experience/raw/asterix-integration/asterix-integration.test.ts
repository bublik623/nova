import { test, expect } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { rawContentProductTypeAsterix } from "../experience-raw.data.js";

const pageUrl = "/experience/test-id/raw/asterix-integration";

test.beforeEach(async ({ page }) => {
  await mockApi(page, "ASX");
  await page.goto(pageUrl);
});

test("the user can see the service and modalities form", async ({ page }) => {
  // check form section exists
  const titleLocator = page.getByText("experience.raw.asterix-integration.service-and-modalities-codes.title");
  await expect(titleLocator).toBeAttached();

  // check field components exists
  const serviceAndModalitiesFields = page.getByTestId("service-and-modalities-field");

  await expect(serviceAndModalitiesFields).toHaveCount(
    rawContentProductTypeAsterix.legacy_adapter_information!.asx_codes!.length
  );
});

test("the user can change the service and modalities and save", async ({ page }) => {
  const removeSecondServiceButton = page.getByTestId("delete-service-and-modalities").nth(1);

  await removeSecondServiceButton.click();

  const serviceAndModalitiesFields = page.getByTestId("service-and-modalities-field");

  await expect(serviceAndModalitiesFields).toHaveCount(
    rawContentProductTypeAsterix.legacy_adapter_information!.asx_codes!.length - 1
  );

  const saveRequestPromise = page.waitForRequest(
    (request) => request.method() === "PATCH" && request.url().includes("experience-raw/mock-raw-id")
  );

  const saveButton = page.getByTestId("document-action-bar-save-content");
  await saveButton.click();

  const saveRequest = await saveRequestPromise;

  expect(saveRequest.postDataJSON()).toMatchObject(
    expect.objectContaining({
      legacy_adapter_information: {
        asx_codes: [
          {
            code: "SVC-1",
            modality_codes: ["MOD-1", "MOD-2"],
          },
        ],
      },
    })
  );
});
