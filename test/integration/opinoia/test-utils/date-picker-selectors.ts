import { Locator, Page } from "@playwright/test";

/**
 * Finds a date picker and returns a set of functions to interact with it
 *
 * @example
 * const datePicker = findDatePicker(page, {
 *   triggerTestId: "date-picker-trigger",
 *   calendarTestId: "date-picker-calendar",
 * });
 *
 * await datePicker.selectDays(fromDate, toDate);
 * // get trigger text
 * const trigger = datePicker.trigger();
 * await trigger.textContent();
 */
export function findDatePicker(
  page: Page,
  config: {
    parentLocator?: Locator;
    triggerTestId: string;
    calendarTestId: string;
  }
) {
  const { triggerTestId, calendarTestId, parentLocator } = config;
  const baseLocator = parentLocator ? parentLocator : page;
  const calendar = baseLocator.getByTestId(calendarTestId);

  const datePicker = {
    open: async () => {
      await datePicker.trigger().click();
      await baseLocator.getByTestId(calendarTestId).waitFor();
    },
    close: async () => {
      await page.click("body");
    },
    selectDay: async (day: number) => {
      await calendar.getByText(day.toString(), { exact: true }).click();
    },
    clickNextMonth: async (times = 1) => {
      await calendar.getByTestId("next-month").click({ clickCount: times });
    },
    clickPrevMonth: async (times = 1) => {
      await calendar.getByTestId("prev-month").click({ clickCount: times });
    },
    trigger: () => {
      return baseLocator.getByTestId(triggerTestId);
    },
  };

  return datePicker;
}
