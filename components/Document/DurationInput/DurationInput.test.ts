import { config, mount } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import DurationInput from "./DurationInput.vue";
import { testId } from "@/utils/test.utils";
import { INSTANT_DURATION } from "@/constants/date.constants";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const selectors = {
  inputs: {
    days: testId("option-single-duration-days"),
    hours: testId("option-single-duration-hours"),
    minutes: testId("option-single-duration-minutes"),
  },
};

describe("DurationInput", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(DurationInput);

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.inputs.days).exists()).toBe(true);
    expect(wrapper.find(selectors.inputs.hours).exists()).toBe(true);
    expect(wrapper.find(selectors.inputs.minutes).exists()).toBe(true);
  });

  test("it should display and emit the correct values", async () => {
    const wrapper = mount(DurationInput, {
      props: reactive({
        modelValue: "P0Y0M4DT2H0M0S",
      }),
    });

    const days = () => wrapper.find<HTMLInputElement>(selectors.inputs.days);
    const hours = () => wrapper.find<HTMLInputElement>(selectors.inputs.hours);
    const minutes = () => wrapper.find<HTMLInputElement>(selectors.inputs.minutes);

    expect(days().element.value).toBe("4");
    expect(hours().element.value).toBe("2");
    expect(minutes().element.value).toBe("0");

    await minutes().setValue(1);

    expect(minutes().element.value).toBe("1");

    expect(wrapper.emitted<string[][]>()["update:modelValue"][0][0]).toBe("P4DT2H1M");
  });

  test("if the duration is P0D (instant), it should emit the INSTANT_DURATION", async () => {
    const wrapper = mount(DurationInput, {
      props: reactive({
        modelValue: "P1D",
      }),
    });

    const days = () => wrapper.find<HTMLInputElement>(selectors.inputs.days);

    await days().setValue(0);

    expect(wrapper.emitted<string[][]>()["update:modelValue"][0][0]).toBe(INSTANT_DURATION);
  });

  test("if is disabled it should not be editable", () => {
    const wrapper = mount(DurationInput, {
      props: {
        modelValue: "P0Y0M4DT2H0M0S",
        disabled: true,
      },
    });

    const days = () => wrapper.find<HTMLInputElement>(selectors.inputs.days);
    const hours = () => wrapper.find<HTMLInputElement>(selectors.inputs.hours);
    const minutes = () => wrapper.find<HTMLInputElement>(selectors.inputs.minutes);

    expect(days().attributes("disabled")).toBe("");
    expect(hours().attributes("disabled")).toBe("");
    expect(minutes().attributes("disabled")).toBe("");
  });

  describe("if the readonly props is true", () => {
    test("the NovaInputNumber should be readonly", () => {
      const wrapper = mount(DurationInput, {
        props: {
          modelValue: "P0Y0M4DT2H0M0S",
          readonly: true,
        },
      });

      expect(wrapper.findComponent({ name: "NovaInputNumber" }).props("readonly")).toBeTruthy();
    });

    test("if the modelValue is empty it should show the no content util", () => {
      const wrapper = mount(DurationInput, {
        props: {
          modelValue: "",
          readonly: true,
        },
      });

      expect(wrapper.findComponent({ name: "NoContentUtil" }).isVisible()).toBeTruthy();
    });
  });
});
