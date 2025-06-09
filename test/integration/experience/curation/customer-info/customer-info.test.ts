import { test, expect } from "@playwright/test";
import mockApi from "../experience-curation.mocks";
import { ExperienceCurationPage } from "../experience-curation.fixture";
import { mockBookingInfo } from "../../raw/customer-info/customer-info.data";
import { testId } from "@/utils/test.utils";

let curationPage: ExperienceCurationPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/experience-1/curation/customer-info");
  await page.waitForSelector("text=experience-shared.save-and-go-to-next-section");

  curationPage = new ExperienceCurationPage(page);
});

test("the user should be able to see and navigate the selected experience customer info", async () => {
  // Check that the amount of fields matches
  expect(await curationPage.formSection.count()).toBe(3);
  const voucherInfoRaw = curationPage.page.locator(testId("info_voucher-textarea")).nth(0);

  expect(await voucherInfoRaw.innerText()).toBe("originalupdated voucher info");

  expect(await curationPage.page.getByTestId("nova-text-editor-tiptap-editor").innerText()).toBe("test info voucher");

  const phoneNumberComponent = curationPage.page.locator(".PhoneNumber");
  const { emergency_contact_number } = mockBookingInfo[0].booking_information;

  expect(await phoneNumberComponent.textContent()).toContain(emergency_contact_number?.country_calling_code);
  expect(await phoneNumberComponent.locator("input").inputValue()).toContain(emergency_contact_number?.number);

  await test.step("the user should be able to see the diffed values", async () => {
    expect(voucherInfoRaw.locator("diff-html").isVisible()).toBeTruthy();
    expect(await voucherInfoRaw.locator("ins").textContent()).toContain("updated");
    expect(await voucherInfoRaw.locator("del").textContent()).toContain("original");
  });
});
