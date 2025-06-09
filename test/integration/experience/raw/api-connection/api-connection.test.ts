import { test, expect } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { mockApiEvents } from "../experience-raw.data.js";

const pageUrl = "/experience/test-id/raw/api-connection";

test.beforeEach(async ({ page }) => {
  await mockApi(page, "SIP");
  await page.goto(pageUrl);
});

test("the user can see the api connection form", async ({ page }) => {
  // check form section exists
  const titleLocator = page.getByText("raw-event-selection-field-recap-title");
  await expect(titleLocator).toBeAttached();

  // check field components exists
  const eventField = page.getByTestId("raw-event-selection-field");

  expect(await eventField.innerHTML()).toContain(mockApiEvents[0].sip_id);
  expect(await eventField.innerHTML()).toContain(mockApiEvents[0].sip_name);
});
