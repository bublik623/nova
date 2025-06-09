import { mount, MountingOptions, VueWrapper, config } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import ScheduleDays, { ScheduleDaysValue, ScheduleDaysProps } from "../ScheduleDays.vue";
import { testId } from "@/utils/test.utils";
import { SHORT_DAY_NAMES } from "@/constants/date.constants";

config.global.mocks = {
  $t: (text: string) => text,
};

const getDefaultDays = (): ScheduleDaysValue => ({
  Mon: { checked: false },
  Tue: { checked: false },
  Wed: { checked: false },
  Thu: { checked: false },
  Fri: { checked: false },
  Sat: { checked: false },
  Sun: { checked: false },
});

let wrapper: VueWrapper<InstanceType<typeof ScheduleDays>>;

const render = (options: MountingOptions<ScheduleDaysProps> = {}) => {
  wrapper = mount(ScheduleDays, {
    props: {
      modelValue: getDefaultDays(),
    },
    ...options,
  });
};

const findSelectAllCheckbox = () => wrapper.find(testId("schedule-select-all")).find("input");
const findDayInputs = () => wrapper.findAll(testId("schedule-day")).map((day) => day.find("input"));

const findMondayInput = () => wrapper.findAll(testId("schedule-day"))[0].get("input");
const findTuesdayInput = () => wrapper.findAll(testId("schedule-day"))[1].get("input");
const findFridayInput = () => wrapper.findAll(testId("schedule-day"))[4].get("input");

describe("ScheduleDays", () => {
  test("it should mount and render correctly", () => {
    render();

    SHORT_DAY_NAMES.forEach((dayName, index) => {
      const dayEl = wrapper.findAll(`[data-testid='schedule-day']`)[index];

      expect(dayEl.get("label").text()).toContain(dayName.toLowerCase());
      expect(dayEl.get("input").element.checked).toBe(false);
      expect(dayEl.get("input").element.disabled).toBe(false);
    });
  });

  test("v-model works", async () => {
    render();

    await findFridayInput().trigger("click");

    const events = wrapper.emitted<ScheduleDaysValue[]>()["update:modelValue"];

    expect(events[0][0]).toEqual<ScheduleDaysValue>({
      Mon: { checked: false },
      Tue: { checked: false },
      Wed: { checked: false },
      Thu: { checked: false },
      Fri: { checked: true },
      Sat: { checked: false },
      Sun: { checked: false },
    });
  });

  test("disable checkboxes", () => {
    const modelValue: ScheduleDaysValue = {
      ...getDefaultDays(),
      Mon: { checked: false, isDisabled: true },
      Fri: { checked: false, isDisabled: true },
    };

    render({ props: { modelValue } });

    expect(findTuesdayInput().element.disabled).toBe(false);
    expect(findMondayInput().element.disabled).toBe(true);
    expect(findFridayInput().element.disabled).toBe(true);
  });

  describe("if it's invalid", () => {
    test("it should display a message", () => {
      render({ props: { modelValue: getDefaultDays(), isInvalid: true } });
      expect(wrapper.text()).toContain("schedule.days.error");
    });
  });

  describe("select all", () => {
    test("it should select all enabled days", async () => {
      render({ props: { selectAll: true, modelValue: getDefaultDays() } });
      await findSelectAllCheckbox().trigger("click");

      const dayInputs = findDayInputs();
      dayInputs.forEach((input) => {
        expect(input.element.getAttribute("aria-checked")).toBe("true");
      });
      expect(findSelectAllCheckbox().element.getAttribute("aria-checked")).toBe("true");
    });

    test("it should deselect all enabled days", async () => {
      render({ props: { selectAll: true, modelValue: getDefaultDays() } });
      await findSelectAllCheckbox().trigger("click"); // Select all
      await findSelectAllCheckbox().trigger("click"); // Deselect all

      const dayInputs = findDayInputs();
      dayInputs.forEach((input) => {
        expect(input.element.getAttribute("aria-checked")).toBe("false");
      });
      expect(findSelectAllCheckbox().element.getAttribute("aria-checked")).toBe("false");
      expect(findSelectAllCheckbox().element.indeterminate).toBe(false);
    });

    test("it should not change disabled days", async () => {
      const modelValue: ScheduleDaysValue = {
        ...getDefaultDays(),
        Mon: { checked: false, isDisabled: true },
        Fri: { checked: false, isDisabled: true },
      };

      render({ props: { modelValue, selectAll: true } });
      await findSelectAllCheckbox().trigger("click");

      const dayInputs = findDayInputs();
      expect(findMondayInput().element.getAttribute("aria-checked")).toBe("false");
      expect(findFridayInput().element.getAttribute("aria-checked")).toBe("false");
      dayInputs.forEach((input, index) => {
        if (index !== 0 && index !== 4) {
          expect(input.element.getAttribute("aria-checked")).toBe("true");
        }
      });
    });

    test("it should set select all checkbox to indeterminate if not all enabled days are selected", async () => {
      const modelValue: ScheduleDaysValue = {
        ...getDefaultDays(),
        Mon: { checked: true },
        Tue: { checked: false },
        Wed: { checked: true },
        Thu: { checked: false },
        Fri: { checked: true },
        Sat: { checked: false },
        Sun: { checked: true },
      };

      render({ props: { modelValue, selectAll: true } });

      expect(findSelectAllCheckbox().element.indeterminate).toBe(true);
    });
  });
});
