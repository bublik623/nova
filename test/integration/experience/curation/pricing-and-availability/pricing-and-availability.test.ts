import { test, expect } from "@playwright/test";
import mockApi from "../experience-curation.mocks";
import { ExperienceCurationPricingAndAvailabilityPage } from "@/test/integration/experience/curation/pricing-and-availability/pricing-and-availability.fixture";
import { mockRefundPolicies } from "@/test/integration/experience/curation/experience-curation.data";

let curationPage: ExperienceCurationPricingAndAvailabilityPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/curation/pricing-and-availability");

  curationPage = new ExperienceCurationPricingAndAvailabilityPage(page);
});

test("Curation Pricing and Availability page", async () => {
  await test.step("the user should be able to see and navigate the selected experience's pricing and availability details", async () => {
    const confirmationDays = curationPage.findByTestId("option-single-duration-days").nth(0);
    const cutOffDays = curationPage.findByTestId("option-single-duration-days").nth(1);

    expect(await curationPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");

    // If the experience has instant confirmation, the confirmation time section is hidden
    expect(await curationPage.formSection.count()).toBe(6);
    expect(await curationPage.findByTestId("nova-alert").isVisible()).toBe(true);

    await expect(await curationPage.findByTestId("radio-card-CALENDAR-TIMESLOTS")).toBeChecked();

    expect(await curationPage.findByTestId("select-button").nth(0).allInnerTexts()).toContain("EUR €");

    expect(await confirmationDays.inputValue()).toBe("0");

    await confirmationDays.fill("13");

    await curationPage.findByTestId("option-single-duration-minutes").nth(0).fill("13");

    await curationPage.findByTestId("input-radio-true").click();

    expect(await curationPage.formSection.count()).toBe(5);
    expect(await curationPage.findByTestId("nova-alert").isVisible()).toBe(false);

    // check that the confirmation time is never higher than the cutoff time
    await curationPage.findByTestId("input-radio-false").click();
    await confirmationDays.nth(0).fill("1");
    await cutOffDays.fill("1");

    await confirmationDays.fill("11");
    expect(await confirmationDays.inputValue()).toBe("11");
    expect(await cutOffDays.inputValue()).toBe("11");

    await cutOffDays.fill("8");
    expect(await confirmationDays.inputValue()).toBe("8");
    expect(await cutOffDays.inputValue()).toBe("8");

    // if the ticket type is open
    // it should show the expiration fields
    await curationPage.findByTestId("radio-card-NO-CALENDAR-FIXED-END").click();
    await curationPage.findByTestId("modal-save-btn").click(); // accept the modal
    expect(await curationPage.formSection.count()).toBe(6);
    expect(
      await curationPage.findByText("experience.pricing.experience-type.NO-CALENDAR-FIXED-END.title").isVisible()
    ).toBeTruthy();
    expect(
      await curationPage.findByText("experience.pricing.experience-type.NO-CALENDAR-FIXED-END.title").isChecked()
    ).toBeTruthy();
    expect(await curationPage.findByTestId("radio-card-NO-CALENDAR-FIXED-VALIDITY").isVisible()).toBeTruthy();

    // cut-off time should not appear
    expect(await curationPage.findByTestId("cutoff-time-input").isVisible()).toBeFalsy();

    await curationPage.findByTestId("radio-card-CALENDAR-TIMESLOTS").click();
    await curationPage.findByTestId("modal-save-btn").click(); // accept the modal
    await curationPage.waitForSelector('[data-testid="cutoff-time-input"]');
    expect(await curationPage.findByTestId("cutoff-time-input").isVisible()).toBeTruthy();
  });

  await test.step("The user is able to filter the fields", async () => {
    await curationPage.filterByAllViewType();
    expect(await curationPage.formSection.count()).toBe(6);
    expect(await curationPage.getSidebarSectionItems.count()).toBe(6);
  });

  await test.step("Refund policies", async () => {
    // Add a new policy
    await curationPage.findByTestId("cancellation-policies-add").click();
    await curationPage.findByTestId("policies-modal-add-btn").click();
    expect(await curationPage.policiesItem.count()).toBe(4);
    await expect(curationPage.findByTestId("policies-modal-add-btn")).toBeDisabled();
    await curationPage.findByTestId("policies-modal-save-btn").click();
    // Edit policies
    expect(await curationPage.policiesItemReadonly.count()).toBe(4);
    await curationPage.findByTestId("cancellation-policies-edit").click();
    await curationPage.editCancellationPolicy(3, 1);
    await curationPage.checkCancellationPolicy(3, 1, "days", 100);

    // Validation
    await expect(curationPage.findByTestId("policies-modal-save-btn")).toBeDisabled();
    await curationPage.editCancellationPolicy(3, 1, "hours", 10);
    await curationPage.checkCancellationPolicy(3, 1, "hours", 10);
    await curationPage.findByTestId("policies-modal-save-btn").click();
    // Delete policies
    await curationPage.findByTestId("cancelletion-policy-item-delete").nth(3).click();
    await curationPage.findByTestId("modal-save-btn").click();
    expect(await curationPage.policiesItemReadonly.count()).toBe(3);
    await curationPage.findByTestId("cancelletion-policy-item-delete").nth(2).click();
    await curationPage.findByTestId("modal-save-btn").click();
    expect(await curationPage.policiesItemReadonly.count()).toBe(2);
    // Change policies radio button
    const refundPolicyRadioNo = curationPage.findByText("experience.refund_policies.radio.no");
    await refundPolicyRadioNo.click();
    const request = await curationPage.checkRequest(/refund-policies.*/, curationPage.saveDraftBtn);
    expect(request.method()).toBe("DELETE");
    expect(request.url()).toContain(mockRefundPolicies[0].id);
  });
});
