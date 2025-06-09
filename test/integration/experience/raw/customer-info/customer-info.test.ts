import { test, expect } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { rawContentProductTypeNova } from "../experience-raw.data";
import { ExperienceRawPage } from "../experience-raw.fixture";
import { mockBookingInfo } from "./customer-info.data";

let rawPage: ExperienceRawPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/raw/customer-info");
  await page.waitForSelector("text=experience-shared.save-and-go-to-next-section");

  rawPage = new ExperienceRawPage(page);
});

test("the user should be able to see and navigate the selected experience customer info", async () => {
  expect(await rawPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");

  // Check that the amount of fields matches
  expect(await rawPage.formSection.count()).toBe(3);

  // Check we display the right data

  const { emergency_contact_number } = mockBookingInfo[0].booking_information;
  expect(await rawPage.findByTestId("phone-number-prefix").innerText()).toBe(
    emergency_contact_number?.country_calling_code
  );
  await rawPage.checkField("input-phone-number", emergency_contact_number?.number);
  await rawPage.checkTextEditor("info_voucher-textarea", rawContentProductTypeNova.commercial.info_voucher);
  await rawPage.checkRadioGroupValue("voucher-type-field", "PRINTED");
});
