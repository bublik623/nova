import { test, expect, Request } from "@playwright/test";
import mockApi from "../experience-raw.mocks";
import { mockRefundPolicies } from "@/test/integration/experience/raw/experience-raw.data";
import { ExperienceRawPricingAndAvailabilityPage } from "@/test/integration/experience/raw/pricing-and-availability/pricing-and-availability.fixture";
import { mockMasterDataPaxList } from "@/test/integration/utils/mockMasterData";
import { ExperiencePaxes } from "@/types/generated/OfferServiceApi";

let rawPage: ExperienceRawPricingAndAvailabilityPage;
test.beforeEach(async ({ page }) => {
  await mockApi(page, "NOVA");

  await page.goto("/experience/test-id/raw/pricing-and-availability");
  await page.waitForSelector("[data-testid='field-pax']");

  rawPage = new ExperienceRawPricingAndAvailabilityPage(page);
});

test("the user should be able to see and navigate the selected experience's pricing and availability details", async ({
  page,
}) => {
  const confirmationDays = rawPage.findByTestId("option-single-duration-days").nth(0);
  const cutOffDays = rawPage.findByTestId("option-single-duration-days").nth(1);

  expect(await rawPage.refCode.innerText()).toBe("experience.common.ref_code EXP0000001");

  // If the experience has instant-confirmation field set to "yes"(true), the confirmation-time field is hidden
  expect(await page.locator("#pricing.confirmation-time").isVisible()).toBe(false);

  await expect(await rawPage.findByTestId("radio-card-CALENDAR-TIMESLOTS")).toBeChecked();

  expect(await rawPage.findByTestId("select-button").nth(0).allInnerTexts()).toContain("EUR €");

  expect(await confirmationDays.inputValue()).toBe("0");

  await confirmationDays.fill("13");

  await rawPage.findByTestId("option-single-duration-minutes").nth(0).fill("13");

  // confirmation time "yes"
  const instantConfirmationYes = rawPage.findByTestId("input-radio-true");
  await instantConfirmationYes.click();
  expect(await page.locator("#pricing.confirmation-time").isVisible()).toBe(false);
  expect(await rawPage.findByTestId("nova-alert").isVisible()).toBe(false);

  // check that the confirmation time is never higher than the cutoff time
  const instantConfirmationNo = rawPage.findByTestId("input-radio-false");
  await instantConfirmationNo.click();
  await confirmationDays.nth(0).fill("1");
  await cutOffDays.fill("1");

  await confirmationDays.fill("11");
  expect(await confirmationDays.inputValue()).toBe("11");
  expect(await cutOffDays.inputValue()).toBe("11");

  await cutOffDays.fill("8");
  expect(await confirmationDays.inputValue()).toBe("8");
  expect(await cutOffDays.inputValue()).toBe("8");

  // if the ticket type is Open
  // it should show the expiration fields
  await rawPage.findByTestId("radio-card-NO-CALENDAR-FIXED-END").click();
  await rawPage.findByTestId("modal-save-btn").click(); // accept the modal
  expect(
    await rawPage.findByText("experience.pricing.experience-type.NO-CALENDAR-FIXED-END.title").isVisible()
  ).toBeTruthy();
  expect(
    await rawPage.findByText("experience.pricing.experience-type.NO-CALENDAR-FIXED-END.title").isChecked()
  ).toBeTruthy();
  expect(await rawPage.findByTestId("radio-card-NO-CALENDAR-FIXED-VALIDITY").isVisible()).toBeTruthy();

  // cut-off time should not appear
  expect(await rawPage.findByTestId("cutoff-time-input").isVisible()).toBeFalsy();

  await rawPage.findByTestId("radio-card-CALENDAR-TIMESLOTS").click();
  await rawPage.findByTestId("modal-save-btn").click(); // accept the modal
  await rawPage.waitForSelector('[data-testid="cutoff-time-input"]');
  expect(await rawPage.findByTestId("cutoff-time-input").isVisible()).toBeTruthy();

  await test.step("Refund policies", async () => {
    // Add a new policy
    await rawPage.findByTestId("cancellation-policies-add").click();
    await rawPage.findByTestId("policies-modal-add-btn").click();
    expect(await rawPage.policiesItem.count()).toBe(4);
    await expect(rawPage.findByTestId("policies-modal-add-btn")).toBeDisabled();
    await rawPage.findByTestId("policies-modal-save-btn").click();

    // Edit policies
    expect(await rawPage.policiesItemReadonly.count()).toBe(4);
    await rawPage.findByTestId("cancellation-policies-edit").click();
    await rawPage.editCancellationPolicy(3, 1);
    await rawPage.checkCancellationPolicy(3, 1, "days", 100);

    // Validation
    await expect(rawPage.findByTestId("policies-modal-save-btn")).toBeDisabled();
    await rawPage.editCancellationPolicy(3, 1, "hours", 10);
    await rawPage.checkCancellationPolicy(3, 1, "hours", 10);
    await rawPage.findByTestId("policies-modal-save-btn").click();

    // Delete policies
    await rawPage.findByTestId("cancelletion-policy-item-delete").nth(3).click();
    await rawPage.findByTestId("modal-save-btn").click();
    expect(await rawPage.policiesItemReadonly.count()).toBe(3);
    await rawPage.findByTestId("cancelletion-policy-item-delete").nth(2).click();
    await rawPage.findByTestId("modal-save-btn").click();
    expect(await rawPage.policiesItemReadonly.count()).toBe(2);

    // Change policies radio button
    const refundPolicyRadioNo = rawPage.findByText("experience.refund_policies.radio.no");
    await refundPolicyRadioNo.click();
    const request = await rawPage.checkRequest(/refund-policies.*/, rawPage.saveDraftButton);
    expect(request.method()).toBe("DELETE");
    expect(request.url()).toContain(mockRefundPolicies[0].id);
  });

  await test.step("field pax", async () => {
    // Check that all expected pax types are displayed
    const adultPaxCode = "adult";
    const childPaxCode = "child";
    const studentPaxCode = "student";
    const seniorPaxCode = "senior";

    await test.step("when form loads", async () => {
      // masterdata GET /pax
      await test.step("shows all available pax options", async () => {
        expect(await rawPage.fieldPax.paxes().count()).toBe(mockMasterDataPaxList.length);
      });
      // offerService GET /experience-paxes
      await test.step("has adult pax selected by default", async () => {
        await expect(rawPage.fieldPax.paxCheckbox(adultPaxCode)).toHaveAttribute("aria-checked", "true");
      });
    });

    await test.step("user can select a pax type", async () => {
      await test.step("select child pax type", async () => {
        await rawPage.fieldPax.paxCheckbox(childPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(childPaxCode)).toHaveAttribute("aria-checked", "true");
      });

      await test.step("select student pax type", async () => {
        await rawPage.fieldPax.paxCheckbox(studentPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(studentPaxCode)).toHaveAttribute("aria-checked", "true");
      });
    });

    await test.step("user can configure pax type properties", async () => {
      await test.step("select child pax type and configure properties", async () => {
        await rawPage.fieldPax.freeOfChargeCheckbox(childPaxCode).click();
        await expect(rawPage.fieldPax.freeOfChargeCheckbox(childPaxCode)).toHaveAttribute("aria-checked", "true");

        await rawPage.fieldPax.ageFromInput(childPaxCode).fill("1");
        await expect(rawPage.fieldPax.ageFromInput(childPaxCode)).toHaveValue("1");

        await rawPage.fieldPax.ageToInput(childPaxCode).fill("5");
        await expect(rawPage.fieldPax.ageToInput(childPaxCode)).toHaveValue("5");
      });

      await test.step("age range inputs should be enabled when all_ages is unchecked", async () => {
        await expect(rawPage.fieldPax.allAgesCheckbox(childPaxCode)).toHaveAttribute("aria-checked", "false");
        await expect(rawPage.fieldPax.ageFromInput(childPaxCode)).toBeEnabled();
        await expect(rawPage.fieldPax.ageToInput(childPaxCode)).toBeEnabled();
      });

      await test.step("age range inputs should be disabled when all_ages is checked", async () => {
        await rawPage.fieldPax.allAgesCheckbox(studentPaxCode).click();

        await expect(rawPage.fieldPax.allAgesCheckbox(studentPaxCode)).toHaveAttribute("aria-checked", "true");
        await expect(rawPage.fieldPax.ageFromInput(studentPaxCode)).toBeDisabled();
        await expect(rawPage.fieldPax.ageToInput(studentPaxCode)).toBeDisabled();
        await test.step("age_from and age_to should be set to 0", async () => {
          await expect(rawPage.fieldPax.ageFromInput(studentPaxCode)).toHaveValue("0");
          await expect(rawPage.fieldPax.ageToInput(studentPaxCode)).toHaveValue("0");
        });
      });
    });

    await test.step("user can deselect a pax type", async () => {
      await test.step("deselect adult pax type", async () => {
        await rawPage.fieldPax.paxCheckbox(adultPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(adultPaxCode)).toHaveAttribute("aria-checked", "false");
      });
    });

    await test.step("user can save", async () => {
      const requestPromise = page.waitForRequest(
        (request: Request) => request.url().includes("experience-paxes") && request.method() === "PUT"
      );

      await rawPage.saveDraftButton.click();

      const requestData = (await requestPromise).postDataJSON() as ExperiencePaxes;

      await test.step("experience_id should be in the payload", async () => {
        expect(requestData).toMatchObject({
          experience_id: "test-id",
        });
      });

      await test.step("adult is deselected it should NOT be in the payload", async () => {
        expect(requestData).not.toMatchObject({
          pax_list: expect.arrayContaining([
            expect.objectContaining({
              pax_code: adultPaxCode,
            }),
          ]),
        });
      });

      await test.step("child pax is selected and it should be in the payload", async () => {
        expect(requestData).toMatchObject({
          pax_list: expect.arrayContaining([
            expect.objectContaining({
              pax_code: childPaxCode,
              pax_type: "PERSON",
              all_ages: false,
              free_of_charge: true,
              age_from: 1,
              age_to: 5,
            }),
          ]),
        });
      });

      await test.step("student pax with all_ages=true should set age_from and age_to undefined", async () => {
        expect(requestData).toMatchObject({
          pax_list: expect.arrayContaining([
            {
              pax_code: studentPaxCode,
              pax_type: "PERSON",
              free_of_charge: false,
              all_ages: true,
              age_from: undefined,
              age_to: undefined,
            },
          ]),
        });
      });
    });

    await test.step("validation: minimum one pax type is required", async () => {
      await test.step("when there is no pax", async () => {
        // deselect child and student pax types
        await rawPage.fieldPax.paxCheckbox(childPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(childPaxCode)).toHaveAttribute("aria-checked", "false");
        await rawPage.fieldPax.paxCheckbox(studentPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(studentPaxCode)).toHaveAttribute("aria-checked", "false");

        await test.step("go to next button should be disabled", async () => {
          await expect(rawPage.saveAndGoNextButton).toBeDisabled();
        });
      });

      await test.step("when there is a pax type selected", async () => {
        await rawPage.fieldPax.paxCheckbox(childPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(childPaxCode)).toHaveAttribute("aria-checked", "true");

        await test.step("go to next button should be enabled", async () => {
          await expect(rawPage.saveAndGoNextButton).toBeEnabled();
        });
      });
    });

    await test.step("validation > overlapping age range", async () => {
      await test.step("setup adult pax with age range 18-65", async () => {
        // Re-select adult pax type that was previously deselected
        await rawPage.fieldPax.paxCheckbox(adultPaxCode).click();
        await expect(rawPage.fieldPax.paxCheckbox(adultPaxCode)).toHaveAttribute("aria-checked", "true");

        // Ensure all_ages is unchecked to enable age range inputs
        await expect(rawPage.fieldPax.allAgesCheckbox(adultPaxCode)).toHaveAttribute("aria-checked", "false");

        // Set age range (18-65)
        await rawPage.fieldPax.ageFromInput(adultPaxCode).fill("18");
        await rawPage.fieldPax.ageToInput(adultPaxCode).fill("65");
      });

      await test.step("setup senior pax with overlapping age range 16-25", async () => {
        await rawPage.fieldPax.paxCheckbox(seniorPaxCode).click();

        // make sure all_ages is unchecked to enable age range inputs
        await expect(rawPage.fieldPax.allAgesCheckbox(seniorPaxCode)).toHaveAttribute("aria-checked", "false");

        // Set overlapping age range (16-25)
        await rawPage.fieldPax.ageFromInput(seniorPaxCode).fill("16");
        await rawPage.fieldPax.ageToInput(seniorPaxCode).fill("25");
      });

      await test.step("when adult pax and senior pax have overlapping age ranges", async () => {
        await test.step("adult pax 'age from' input should have error", async () => {
          await expect(rawPage.fieldPax.ageFromInput(adultPaxCode)).toHaveAttribute("data-invalid", "true");
          await expect(rawPage.fieldPax.ageToInput(adultPaxCode)).not.toHaveAttribute("data-invalid", "true");
        });
        await test.step("senior pax 'age to' input should have error", async () => {
          await expect(rawPage.fieldPax.ageToInput(seniorPaxCode)).toHaveAttribute("data-invalid", "true");
          await expect(rawPage.fieldPax.ageFromInput(seniorPaxCode)).not.toHaveAttribute("data-invalid", "true");
        });

        await test.step("error alert for overlapping age ranges is displayed", async () => {
          await expect(page.getByTestId("pax-error-overlapping-age-range")).toBeVisible();
        });

        await test.step("save button is disabled", async () => {
          await expect(rawPage.saveDraftButton).toBeDisabled();
        });
      });
    });
  });
});
