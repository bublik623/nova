import { test, expect } from "@playwright/test";
import mockApi, { experienceRawURL } from "../experience-raw.mocks";
import { mockDistributionContentWithSupplierId, rawContentProductTypeNova } from "../experience-raw.data";
import { ExperienceRawSettingsPage, FieldSupplierComponent } from "./settings.fixture";
import { BRAND_NATIONAL_GEOGRAPHIC } from "@/features/experience-raw/constants";

let rawPage: ExperienceRawSettingsPage;

test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/raw/settings");

  rawPage = new ExperienceRawSettingsPage(page);
});

test("The page requests the correct data on load", async ({ page }) => {
  const distributionContent = "http://localhost:8084/distribution-content/test-id";
  const rawContent = "http://localhost:8084/v2/experience-raw?filters=experience_id%3D%3Dtest-id";

  await page.waitForRequest(distributionContent, {
    timeout: 5000,
  });
  await page.waitForRequest(rawContent, {
    timeout: 5000,
  });
});

test("The user should see the correct navigation items", async () => {
  const titleNavState = await rawPage.sidebarItemState("title");
  const supplierNavState = await rawPage.sidebarItemState("supplier_id");
  const externalReferenceCodeNavState = await rawPage.sidebarItemState("external_reference_code");
  const categoriesNavState = await rawPage.sidebarItemState("categories_interests");
  const promotionalOptionsNavState = await rawPage.sidebarItemState("promotional_options");
  const productBrandNavState = await rawPage.sidebarItemState("product_brand");
  const natGeoLevelsNavState = await rawPage.sidebarItemState("nat_geo_tour_levels");
  const ownOfferNavState = await rawPage.sidebarItemState("own_offer");

  const sidebarItemCount = 8;

  expect(await rawPage.formSection.count()).toBe(sidebarItemCount);

  expect(titleNavState.completed).toBe(true);
  expect(titleNavState.required).toBe(true);

  expect(supplierNavState.completed).toBe(true);
  expect(supplierNavState.required).toBe(true);

  expect(externalReferenceCodeNavState.completed).toBe(true);
  expect(externalReferenceCodeNavState.required).toBe(false);

  expect(categoriesNavState.completed).toBe(true);
  expect(categoriesNavState.required).toBe(true);

  expect(promotionalOptionsNavState.completed).toBe(true);
  expect(promotionalOptionsNavState.required).toBe(false);

  expect(productBrandNavState.completed).toBe(true);
  expect(productBrandNavState.required).toBe(false);

  expect(natGeoLevelsNavState.completed).toBe(true);
  expect(natGeoLevelsNavState.required).toBe(true);

  expect(ownOfferNavState.completed).toBe(true);
  expect(ownOfferNavState.required).toBe(true);
});

test("The form should display the correct initial values", async ({ page }) => {
  const fieldSupplier = new FieldSupplierComponent({ page, fieldTestId: "supplier-name-input-text" });

  // Title field
  expect(await rawPage.titleInput.inputValue()).toBe(rawContentProductTypeNova.commercial.title);

  // Supplier name field
  expect(await fieldSupplier.selectedSupplierId()).toBe("test-supplier-id");

  // External reference code field
  expect(await rawPage.fieldExternalReferenceCode.inputValue()).toBe(
    rawContentProductTypeNova.functional?.external_reference_code
  );

  // Experience category and interests field
  await rawPage.checkCategoriesAndInterests({
    category: "Boat trips",
    interests: ["Bike", "Golf"],
  });

  // Promotional options
  await expect(page.getByTestId("input-radio-PROMOTIONAL_SELL_OUT")).toBeChecked();

  // Product brand
  await expect(page.getByTestId("input-radio-" + BRAND_NATIONAL_GEOGRAPHIC)).toBeChecked();
  // Nat Geo Levels should be visible and checked when the product brand is Nat Geo
  await expect(page.getByTestId("input-radio-NAT_GEO_TOUR_LEVEL_ENTRY")).toBeChecked();
});

test("it should not prompt the user when it has no unsaved changes and tries to navigate away", async () => {
  await rawPage.clickSidebarLink(`content_generation`);
  await expect(rawPage.modalUnsavedChanges).not.toBeVisible();
});

test("if the user saves after changes it should not block the navigation", async ({ page }) => {
  // When the user updates the title, the query should refresh and we need to respond with the "updated" title
  await page.route(`${experienceRawURL}/v2/experience-raw*`, async (route) => {
    const json = [
      {
        commercial: {
          title: "Hello World!",
        },
        id: "mock-raw-id",
        experience_id: "mock-experience-id",
      },
    ];
    await route.fulfill({ json });
  });

  // this test was added to cover a bug where the user was blocked after saving
  await rawPage.titleInput.fill("Hello World!");
  await rawPage.saveDraft();
  await rawPage.clickSidebarLink(`content_generation`);
  expect(await rawPage.modalUnsavedChanges.isVisible()).toBe(false);
  await rawPage.clickSidebarLink(`settings`);
  expect(await rawPage.modalUnsavedChanges.isVisible()).toBe(false);

  await rawPage.clickSidebarLink(`content_generation`);
  expect(await rawPage.modalUnsavedChanges.isVisible()).toBe(false);
});

test("The page should prompt the user when it has unsaved changes and tries to navigate away", async () => {
  await rawPage.titleInput.fill("Hello World!");
  await rawPage.clickSidebarLink(`content_generation`);
  await expect(rawPage.modalUnsavedChanges).toBeVisible();
});

test("The save button should be disabled if the Title field is empty", async () => {
  // The test should start with the save button enabled
  await expect(rawPage.saveDraftButton).not.toBeDisabled();
  await expect(rawPage.titleInputError).not.toBeVisible();

  await rawPage.titleInput.fill("");
  await expect(rawPage.saveDraftButton).toBeDisabled();

  await expect(rawPage.titleInputError).toBeVisible();
});

test("The save button should be enabled if the Title is filled", async () => {
  await rawPage.titleInput.fill("");

  // The test should start with the save button disabled
  await expect(rawPage.saveDraftButton).toBeDisabled();

  await rawPage.titleInput.fill("Test");
  await expect(rawPage.saveDraftButton).not.toBeDisabled();
});

test("The correct data should be sent when saving", async ({ page }) => {
  const setupDistributionPatchRequest = page.waitForRequest(
    (request) => request.method() === "PATCH" && request.url().includes("distribution-content")
  );
  const setupExperienceRawPatchRequest = page.waitForRequest(
    (request) => request.method() === "PATCH" && request.url().includes("experience-raw")
  );

  await rawPage.titleInput.fill("Test");
  await page.getByTestId("field-supplier-edit-btn").click();
  await page.getByTestId("supplier-name-input-text").click();
  await page.getByTestId("options-list-list-item-3fa85f64-5717-4562-b3fc-2c963f66afa6").click();
  await page.getByTestId("field-supplier-save-selection-btn").click();
  await page.getByTestId("external_reference_code-input-text").click();
  await page.getByTestId("external_reference_code-input-text").fill("new test reference code");
  await page.getByTestId("experience-category-edit-btn").click();
  await page.getByRole("button", { name: "Shorex" }).click();
  await page.getByTestId("category-modal-next-btn").click();
  await page.getByTestId("category-modal-save-btn").click();
  await page.getByTestId("input-radio-PROMOTIONAL_SPECIAL").check();
  await page.getByTestId("input-radio-OWN_OFFER_TEST").check();
  await page.getByTestId("input-radio-OWN_OFFER_TUI_DESIGNED_3P_OPERATED").check();

  await page.getByTestId("document-action-bar-save-content").click();

  const experienceRawPatchRequest = await setupExperienceRawPatchRequest;

  expect(experienceRawPatchRequest.url()).toBe(`${experienceRawURL}/experience-raw/mock-raw-id`);
  expect(experienceRawPatchRequest.postDataJSON()).toEqual({
    commercial: {
      title: "Test",
    },
    functional: {
      additional_services: [
        "BRAND_NATIONAL_GEOGRAPHIC",
        "PROMOTIONAL_SPECIAL",
        "NAT_GEO_TOUR_LEVEL_ENTRY",
        "OWN_OFFER_TEST",
        "OWN_OFFER_TUI_DESIGNED_3P_OPERATED",
        "DURATION_6_8",
      ],
      categories: ["SHOREX"],
      external_reference_code: "new test reference code",
    },
    experience_id: "mock-experience-id",
  });

  const distributionPAtchRequest = await setupDistributionPatchRequest;
  expect(distributionPAtchRequest.url()).toBe(
    `${experienceRawURL}/distribution-content/f414ee19-a194-4e96-9785-3d08cc6f086a`
  );
  expect(distributionPAtchRequest.postDataJSON()).toEqual({
    id: "f414ee19-a194-4e96-9785-3d08cc6f086a",
    supplier_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  });
});

test("When selecting a NAT GEO Product Brand", async ({ page }) => {
  const natGeoSection = page.locator("#nat_geo_tour_level");
  const ownOfferRadio = page.getByTestId("input-radio-OWN_OFFER_TEST");
  const natGeoRadio = page.getByTestId("input-radio-" + BRAND_NATIONAL_GEOGRAPHIC);
  const natGeoLevelRadio = page.getByTestId("input-radio-NAT_GEO_TOUR_LEVEL_ENTRY");

  const natGeoLevelRadioMid = page.getByTestId("input-radio-NAT_GEO_TOUR_LEVEL_MID");
  const productBrandNavState = async () => await rawPage.sidebarItemState("product_brand");
  const natGeoLevelsNavState = async () => await rawPage.sidebarItemState("nat_geo_tour_levels");

  await test.step("The user should see an additional NAT GEO LEVELS field and nav items", async () => {
    await natGeoRadio.check();
    await expect(natGeoSection).toBeVisible();
    expect((await productBrandNavState()).completed).toBe(true);
    expect((await productBrandNavState()).required).toBe(false);

    await ownOfferRadio.check();
    await expect(natGeoSection).not.toBeVisible();

    await natGeoRadio.check();
    await expect(natGeoSection).toBeVisible();
    expect((await natGeoLevelsNavState()).completed).toBe(false);
    expect((await natGeoLevelsNavState()).required).toBe(true);

    await natGeoLevelRadio.check();
    expect((await natGeoLevelsNavState()).completed).toBe(true);
  });

  await test.step("The correct data should be sent when saving", async () => {
    const saveRequest = page.waitForRequest((request) => request.method() === "PATCH");

    await natGeoLevelRadioMid.check();

    await rawPage.saveDraft();

    const request = await saveRequest;

    expect(request.method()).toBe("PATCH");
    expect(request.url()).toBe(`${experienceRawURL}/experience-raw/mock-raw-id`);
    expect(request.postDataJSON()).toMatchObject({
      functional: {
        additional_services: [
          "BRAND_NATIONAL_GEOGRAPHIC",
          "PROMOTIONAL_SELL_OUT",
          "NAT_GEO_TOUR_LEVEL_MID",
          "OWN_OFFER_TUI_DESIGNED_OPERATED",
          "DURATION_6_8",
        ],
      },
    });
  });
});

test("When selecting a Supplier", async ({ page }) => {
  const fieldSupplier = new FieldSupplierComponent({ page, fieldTestId: "supplier-name-input-text" });

  await test.step("The user should be able to select a supplier", async () => {
    await fieldSupplier.findEditButton().click();
    await fieldSupplier.selectSupplier("Musement");

    expect(await fieldSupplier.inputValue()).toBe("Musement");
    await fieldSupplier.findSaveSelectionButton().click();
  });

  await test.step("The correct data should be sent when saving", async () => {
    const initSaveDistributionRequest = page.waitForRequest((request) => {
      if (request.url().includes("experience-raw")) {
        throw new Error("The request should not be sent to the experience-raw endpoint");
      }

      return request.method() === "PATCH" && request.url().includes("distribution-content");
    });

    await rawPage.saveDraftButton.click();

    const saveDistributionRequest = await initSaveDistributionRequest;

    expect(saveDistributionRequest.method()).toBe("PATCH");
    expect(saveDistributionRequest.url()).toBe(
      `${experienceRawURL}/distribution-content/${mockDistributionContentWithSupplierId.id}`
    );
    expect(saveDistributionRequest.postDataJSON()).toMatchObject({
      supplier_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    });
  });
});

test("When selecting a TUI COLLECTION Product Brand", async ({ page }) => {
  const natGeoRadio = page.getByTestId("input-radio-" + BRAND_NATIONAL_GEOGRAPHIC);
  const tuiCollectionRadio = page.getByTestId("input-radio-BRAND_TUI_COLLECTION");

  const collectionCriteriaNav = page.getByTestId("sidebar-section-item-collection_criteria");

  const exceptionalExperiencesEditor = page
    .getByTestId("collection-criteria-exceptional-experiences")
    .getByTestId("nova-text-editor-tiptap-editor");

  const bestValueGuaranteedEditor = page
    .getByTestId("collection-criteria-best-value-guaranteed")
    .getByTestId("nova-text-editor-tiptap-editor");

  const createdWithCareEditor = page
    .getByTestId("collection-criteria-created-with-care")
    .getByTestId("nova-text-editor-tiptap-editor");

  await test.step("The user should see the TUI COLLECTION criteria fields and nav items", async () => {
    await natGeoRadio.check();

    // we can only check one editor
    await expect(exceptionalExperiencesEditor).not.toBeVisible();
    await expect(collectionCriteriaNav).not.toBeVisible();

    await tuiCollectionRadio.check();

    await expect(collectionCriteriaNav).toBeVisible();

    // now we need to check all editors
    await expect(exceptionalExperiencesEditor).toHaveText("test exceptional experiences");
    await expect(bestValueGuaranteedEditor).toHaveText("test best value guaranteed");
    await expect(createdWithCareEditor).toHaveText("test created with care");
  });

  await test.step("The user should be able to update the editors", async () => {
    await page
      .getByTestId("collection-criteria-exceptional-experiences")
      .getByTestId("nova-text-editor-tiptap-editor")
      .locator("div")
      .fill("new exceptional experiences");
    await page
      .getByTestId("collection-criteria-best-value-guaranteed")
      .getByTestId("nova-text-editor-tiptap-editor")
      .locator("div")
      .fill("new best value guaranteed");
    await page
      .getByTestId("collection-criteria-created-with-care")
      .getByTestId("nova-text-editor-tiptap-editor")
      .locator("div")
      .fill("new created with care");
  });

  await test.step("The correct data should be sent when saving", async () => {
    const saveRequest = page.waitForRequest(
      (request) => request.method() === "PATCH" && request.url().includes("experience-raw")
    );

    await rawPage.saveDraftButton.click();

    const request = await saveRequest;

    expect(request.method()).toBe("PATCH");
    expect(request.url()).toBe(`${experienceRawURL}/experience-raw/mock-raw-id`);
    expect(request.postDataJSON().collection_criteria).toMatchObject({
      exceptional_experiences: "<p>new exceptional experiences</p>",
      best_value_guaranteed: "<p>new best value guaranteed</p>",
      created_with_care: "<p>new created with care</p>",
    });
  });
});

test("The user should be able to select an Experience Category and Interests", async ({ page }) => {
  // Initial values
  await expect(page.getByText("Bike, Golf", { exact: true })).toBeVisible();

  await page.getByTestId("experience-category-edit-btn").click();
  await page.getByRole("button", { name: "Activities" }).click();
  await page.getByTestId("category-modal-next-btn").click();

  await page.getByText("Air activities").click();
  await page.getByText("Food & drink").click();

  await page.getByTestId("category-modal-save-btn").click();

  await expect(page.getByText("Activities", { exact: true })).toBeVisible();
  await expect(page.getByText("Bike, Golf, Air activities, Food & drink", { exact: true })).toBeVisible();

  await test.step("The correct data should be sent when saving", async () => {
    const saveRequest = page.waitForRequest((request) => request.method() === "PATCH");

    await rawPage.saveDraft();

    const request = await saveRequest;
    const data = request.postDataJSON();

    expect(request.method()).toBe("PATCH");
    expect(request.url()).toBe(`${experienceRawURL}/experience-raw/mock-raw-id`);
    expect(data.functional.categories).toStrictEqual(["ACTIVITIES"]);
    expect(data.functional.interests).toStrictEqual(["BIKE", "GOLF", "AIR_ACTIVITIES", "FOOD_AND_DRINK"]);
  });
});

test("The user should be able to save and navigate to the next page", async ({ page }) => {
  // When the user updates the title, the query should refresh and we need to respond with the "updated" title
  await page.route(`${experienceRawURL}/v2/experience-raw*`, async (route) => {
    const json = [
      {
        commercial: {
          title: "Hello World!",
        },
        id: "mock-raw-id",
        experience_id: "mock-experience-id",
      },
    ];
    await route.fulfill({ json });
  });

  await rawPage.titleInput.fill("Hello World!");
  await rawPage.page.getByTestId("go-to-next-route-button").click();
  await rawPage.checkNotifications("notifications.success.saving.document");

  await expect(rawPage.page).toHaveURL("http://localhost:3001/experience/test-id/raw/location");
});

test("The user should be able to save in the settings page if the url includes params or an hash", async () => {
  await test.step("it should save with no params or hash", async () => {
    await rawPage.page.goto("/experience/test-id/raw/settings");
    await rawPage.page.getByTestId("title-input-text").fill("Test");

    await rawPage.saveDraft();
    await rawPage.checkNotifications("notifications.success.saving.document");
  });

  await test.step("it should save with an hash in the url", async () => {
    await rawPage.page.goto("/experience/test-id/raw/settings#test");
    await rawPage.page.getByTestId("title-input-text").fill("Test");

    await rawPage.saveDraft();
    await rawPage.checkNotifications("notifications.success.saving.document");
  });

  await test.step("it should save with params in the url", async () => {
    await rawPage.page.goto("/experience/test-id/raw/settings?test=test");
    await rawPage.page.getByTestId("title-input-text").fill("Test");

    await rawPage.saveDraft();
    await rawPage.checkNotifications("notifications.success.saving.document");
  });
});
