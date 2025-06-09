import { test, expect, Request } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { ExperienceLocationPage } from "./location.fixture";
import { RawElement } from "@/types/generated/ExperienceRawServiceApi";

const pageUrl = "/experience/test-id/raw/location";

// pageObject
let po: ExperienceLocationPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto(pageUrl);
  await page.waitForSelector("text=experience.location.city.title");

  po = new ExperienceLocationPage(page);
});

test("location - raw flow", async ({ page }) => {
  const isExperienceRawRequest = (request: Request) =>
    request.method() === "PATCH" && request.url().includes("/experience-raw/");

  await test.step("user can select a city", async () => {
    // select Split (Croatia)
    await po.findFieldCity().clear();
    await po.findFieldCity().selectOption(1);

    expect(await po.findFieldCity().selectedCity()).toContain("Split");
  });

  await test.step("user can view `address` field", async () => {
    expect(await po.findAddress().inputValue()).toContain("Location Text");
  });

  await test.step("user can view `map` field", async () => {
    await expect(await po.findMap()).toBeVisible();
  });

  await test.step("user can add and remove additional cities", async () => {
    const additionalCities = po.findFieldAdditionalCities();
    const additionalCitiesList = po.findFieldAdditionalCitiesList();

    expect(await additionalCitiesList.isVisible()).toEqual(false);

    // Add two cities
    await additionalCities.selectOption(0);
    await additionalCities.selectOption(1);
    await additionalCities.closeDropdown();

    expect(await additionalCitiesList.isVisible()).toEqual(true);

    // Check if the selected cities are displayed in the list
    const selectedCities = await additionalCitiesList.selectedItems();
    expect(selectedCities.length).toBe(2);

    // Remove one city
    await additionalCitiesList.removeItem(0);

    // Check if the city was removed
    const updatedCities = await additionalCitiesList.selectedItems();
    expect(updatedCities.length).toBe(1);
    expect(updatedCities[0]).toEqual(selectedCities[1]);
  });

  await test.step("the user can update the meeting point details text field", async () => {
    const patchRequestPromise = page.waitForRequest(isExperienceRawRequest);

    await po.findMeetingPoint().type("new meeting point details");

    await po.findSaveDraftButton().click();

    const patchRequest = await patchRequestPromise;
    expect(patchRequest.postDataJSON()).toMatchObject({
      experience_id: "test-id",
      commercial: { meeting_point_details: "<p>new meeting point details</p>" },
    } as Partial<RawElement>);
  });

  await test.step("user can manage venues in raw", async () => {
    await test.step("user can add a new venue", async () => {
      const patchRequestPromise = page.waitForRequest(isExperienceRawRequest);
      // Select the venue
      await po.findFieldVenues().selectOption(0);
      await po.findFieldVenues().closeDropdown();

      // Check the updated venues
      const updatedVenues = await po.findFieldVenuesList().selectedItems();
      expect(updatedVenues.length).toBe(1);
      expect(updatedVenues[0].name).toEqual("Colosseum");

      // click the save button
      await po.findSaveDraftButton().click();

      // Verify the request method
      const patchRequest = await patchRequestPromise;
      expect(patchRequest.postDataJSON()).toMatchObject({
        experience_id: "test-id",
        functional: { venues: ["ZAD2"] },
      } satisfies Partial<RawElement>);
    });

    await test.step("user can update venues", async () => {
      const patchRequestPromise = page.waitForRequest(isExperienceRawRequest);

      await po.findFieldVenues().selectOption(1);
      await po.findFieldVenues().closeDropdown();

      // Check the updated venues
      const updatedVenues = await po.findFieldVenuesList().selectedItems();
      expect(updatedVenues.length).toBe(2);
      expect(updatedVenues[0].name).toEqual("Colosseum");
      expect(updatedVenues[1].name).toEqual("Town in Split");

      // Wait for the PATCH request and click the save button
      await po.findSaveDraftButton().click();

      const patchRequest = await patchRequestPromise;
      expect(patchRequest.postDataJSON()).toMatchObject({
        experience_id: "test-id",
        functional: { venues: ["ZAD2", "ZAD1"] },
      } satisfies Partial<RawElement>);
    });

    await test.step("user can delete venues", async () => {
      const patchRequestPromise = page.waitForRequest(isExperienceRawRequest);

      // Open venues and delete venues items
      await po.findFieldVenuesList().removeItem(1);
      await po.findFieldVenuesList().removeItem(0);

      const updatedVenues = await po.findFieldVenuesList().selectedItems();
      // Verifies the number of items in the list
      expect(updatedVenues.length).toEqual(0);

      // Wait for the PATCH request and click the save button
      await po.findSaveDraftButton().click();

      const patchRequest = await patchRequestPromise;
      expect(patchRequest.postDataJSON()).toMatchObject({
        experience_id: "test-id",
        functional: { venues: [] },
      } satisfies Partial<RawElement>);
    });

    await test.step("when user updates the city, the venues in that city are removed", async () => {
      await po.findFieldVenues().selectOption(0);
      await po.findFieldVenues().closeDropdown();

      // update the city
      await po.findFieldCity().clear();
      await po.findFieldCity().selectOption(0);

      // check the venues are reset
      expect(await po.findFieldVenuesList().selectedItems()).toHaveLength(0);
    });

    await test.step("when user updates the additional cities, the venues in that cities are removed", async () => {
      // add a venue
      await po.findFieldAdditionalCities().selectOption(2); // Corfu
      await po.findFieldAdditionalCities().closeDropdown();
      await po.findFieldVenues().selectOption(0); // Olympic Palace
      await po.findFieldVenues().closeDropdown();

      expect(await po.findFieldVenuesList().selectedItems()).toHaveLength(1);

      // update the additional cities
      await po.findFieldAdditionalCities().selectOption(2); // Corfu
      await po.findFieldAdditionalCities().closeDropdown();

      expect(await po.findFieldVenuesList().selectedItems()).toHaveLength(0);
      expect(await po.findFieldVenues().selectedText()).toContain("0");
    });
  });
});
