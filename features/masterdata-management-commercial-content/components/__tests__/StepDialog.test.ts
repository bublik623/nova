import { config, mount } from "@vue/test-utils";
import StepDialog from "../StepDialog.vue";
import { describe, expect, test } from "vitest";

config.global.mocks = {
  $t: (s: string) => s,
};

const slots = {
  title: "Test Title",
  "step-1": "<div>Step 1</div>",
  "step-2": "<div>Step 2</div>",
  "step-3": "<div>Step 3</div>",
  complete: "<div>Complete</div>",
};

const selectors = {
  dialog: '[data-testid="dialog"]',
  dialogHeader: '[data-testid="dialog-header"]',
  dialogHeaderTitle: '[data-testid="dialog-header-title"]',
  dialogHeaderClose: '[data-testid="dialog-header-close"]',
  dialogBody: '[data-testid="dialog-body"]',
  dialogBodyStep1: '[data-testid="dialog-body-step-1"]',
  dialogBodyStep2: '[data-testid="dialog-body-step-2"]',
  dialogBodyStep3: '[data-testid="dialog-body-step-3"]',
  dialogFooter: '[data-testid="dialog-footer"]',
  dialogFooterBack: '[data-testid="dialog-footer-back"]',
  dialogFooterNext: '[data-testid="dialog-footer-next"]',
};

describe("StepDialog.vue", () => {
  test("renders the title slot when passed", async () => {
    const wrapper = mount(StepDialog, {
      slots,
    });
    expect(wrapper.find(selectors.dialogHeaderTitle).text()).toBe("Test Titlecommon.step 1/3");
    await wrapper.find(selectors.dialogFooterNext).trigger("click");
    expect(wrapper.find(selectors.dialogHeaderTitle).text()).toBe("Test Titlecommon.step 2/3");
    await wrapper.find(selectors.dialogFooterNext).trigger("click");
    expect(wrapper.find(selectors.dialogHeaderTitle).text()).toBe("Test Titlecommon.step 3/3");
  });

  test("emits close event when close button is clicked", async () => {
    const wrapper = mount(StepDialog);
    await wrapper.find(selectors.dialogHeaderClose).trigger("click");
    expect(wrapper.emitted().close).toBeTruthy();
  });

  test("renders the passed slots when next button is clicked", async () => {
    const wrapper = mount(StepDialog, {
      slots,
    });

    for (let step = 1; step <= 3; step++) {
      expect(wrapper.find(`[data-testid="dialog-body-step-${step}"]`).exists()).toBe(true);
      if (step < 3) {
        await wrapper.find(selectors.dialogFooterNext).trigger("click");
      }
    }
    expect(wrapper.html()).toContain("Complete");
  });

  // those two tests look similar but test different behaviors
  test("it correctly display the next and back button", async () => {
    const wrapper = mount(StepDialog, {
      slots,
    });

    expect(wrapper.find(selectors.dialogFooterBack).exists()).toBe(false);
    expect(wrapper.find(selectors.dialogFooterNext).exists()).toBe(true);

    await wrapper.find(selectors.dialogFooterNext).trigger("click");
    expect(wrapper.find(selectors.dialogFooterBack).exists()).toBe(true);
    expect(wrapper.find(selectors.dialogFooterNext).exists()).toBe(true);

    await wrapper.find(selectors.dialogFooterNext).trigger("click");
    expect(wrapper.find(selectors.dialogFooterBack).exists()).toBe(true);
    expect(wrapper.find(selectors.dialogFooterNext).exists()).toBe(false);
    expect(wrapper.html()).toContain("Complete");
  });
});
