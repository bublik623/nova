import { expect, test } from "@playwright/test";
import { ExperienceLocationPage } from "./location.fixture";
import mockApi from "../experience-curation.mocks";
import { ExperienceVenues } from "@/types/generated/MetadataExperiencesApi";

const pageUrl = "/experience/test-id/curation/location";

// pageObject
let po: ExperienceLocationPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto(pageUrl);
  await page.waitForSelector("text=experience.location.city.title");

  po = new ExperienceLocationPage(page);
});

test("location - curation flow", async ({ page }) => {
  await test.step("user can select a city", async () => {
    // select Split (Croatia)
    await po.findFieldCity().clear();
    await po.findFieldCity().selectOption(1);

    expect(await po.findFieldCity().selectedCity()).toContain("Split");
  });

  await test.step("user can add and remove additional cities in curation", async () => {
    expect(await po.findAdditionalCitiesList().isVisible()).toEqual(false);

    // Add two cities
    await po.findAdditionalCities().selectOption(0);
    await po.findAdditionalCities().selectOption(1);
    await po.findAdditionalCities().closeDropdown();

    expect(await po.findAdditionalCitiesList().isVisible()).toEqual(true);

    // Check if the selected cities are displayed in the list
    const selectedCities = await po.findAdditionalCitiesList().selectedItems();
    expect(selectedCities.length).toBe(2);

    // Remove one city
    await po.findAdditionalCitiesList().removeItem(0);

    // Check if the city was removed
    const updatedCities = await po.findAdditionalCitiesList().selectedItems();
    expect(updatedCities.length).toBe(1);
    expect(updatedCities[0]).toEqual(selectedCities[1]);
  });

  await test.step("user can manage venues in curation", async () => {
    const postRequestPromise = page.waitForRequest(
      (request) => request.method() === "POST" && request.url().includes("/experience-venues")
    );
    const putRequestPromise = page.waitForRequest(
      (request) => request.method() === "PUT" && request.url().includes("/experience-venues")
    );
    const deleteRequestPromise = page.waitForRequest(
      (request) => request.method() === "DELETE" && request.url().includes("/experience-venues")
    );

    await test.step("user can remove a venues", async () => {
      await po.findVenues().selectOption(0);
      await po.findVenues().closeDropdown();

      await po.findVenuesList().removeItem(0);
      await po.findSaveDraftButton().click();

      const deleteRequest = await deleteRequestPromise;
      expect(deleteRequest.method()).toBe("DELETE");
      expect(deleteRequest.url()).toContain("/experience-venues/test-venue-id");
    });

    await test.step("user can add a new venue", async () => {
      await po.findVenues().selectOption(0);
      await po.findVenues().closeDropdown();
      await po.findSaveDraftButton().click();

      const postRequest = await postRequestPromise;
      expect(postRequest.method()).toBe("POST");
      expect(postRequest.url()).toContain("/experience-venues");
      expect(postRequest.postDataJSON()).toMatchObject({
        experience_id: "test-id",
        venues: ["ZAD2"],
      } satisfies ExperienceVenues);
    });

    await test.step("user can update venues", async () => {
      await po.findVenues().selectOption(1);
      await po.findVenues().closeDropdown();
      await po.findSaveDraftButton().click();

      const putRequest = await putRequestPromise;
      expect(putRequest.method()).toBe("PUT");
      // new-venue-id is coming from headers: {location: "/experience-venues/new-venue-id"}
      expect(putRequest.url()).toContain("/experience-venues/new-venue-id");
      expect(putRequest.postDataJSON()).toMatchObject({
        experience_id: "test-id",
        venues: ["ZAD2", "ZAD1"],
      } satisfies ExperienceVenues);
    });

    await test.step("when user updates the city, the venues in that city are removed", async () => {
      // select Split
      await po.findVenues().selectOption(0);
      await po.findVenues().closeDropdown();

      // update the city
      await po.findFieldCity().clear();
      await po.findFieldCity().selectOption(0);

      expect(await po.findVenuesList().selectedItems()).toHaveLength(0);
    });

    await test.step("when user updates the additional cities, the venues in that cities are removed", async () => {
      // add a venue
      await po.findAdditionalCities().selectOption(2); // Corfu
      await po.findAdditionalCities().closeDropdown();
      await po.findVenues().selectOption(0); // Olympic Palace
      await po.findVenues().closeDropdown();

      expect(await po.findVenuesList().selectedItems()).toHaveLength(1);

      // update the additional cities
      await po.findAdditionalCities().selectOption(2); // Corfu
      await po.findAdditionalCities().closeDropdown();

      expect(await po.findVenuesList().selectedItems()).toHaveLength(0);
      expect(await po.findVenues().selectedText()).toContain("0");
    });
  });

  await test.step("user can view `address` field", async () => {
    expect(await po.findAddress().inputValue()).toContain("Location Text");
  });

  await test.step("user can view `map` field", async () => {
    await expect(await po.findMap()).toBeVisible();
  });

  await test.step("user can view and edit `meeting point details` field", async () => {
    await po.findMeetingPoint().type("meeting text");

    expect(await po.findMeetingPoint().text()).toContain("meeting text");
  });

  await test.step("diff location input", async () => {
    await test.step("diff", async () => {
      expect(po.findMeetingPointRaw().locator("diff-html").isVisible());
      expect(await po.findMeetingPointRaw().locator("ins").textContent()).toContain("added text");
      expect(await po.findMeetingPointRaw().locator("del").textContent()).toContain("removed text");
    });
  });
});
