import { Locator, Page } from "@playwright/test";

/**
 * Finds an inline select and returns a set of functions to interact with it
 *
 * @example
 * const inlineSelect = findInlineSelect(page, {
 *   triggerTestId: "inline-select-trigger",
 *   contentTestId: "inline-select-content",
 *   searchTestId: "inline-select-search",
 *   getOptionSelector: (value) => `[data-testid="option-${value}"]`,
 * });
 * // select an option
 * await inlineSelect.open();
 * await inlineSelect.selectOption("option-1");
 * // search
 * await inlineSelect.search("option");
 * // get trigger text
 * const trigger = inlineSelect.trigger();
 * await trigger.textContent();
 */
export function findInlineSelect(
  page: Page,
  config: {
    parentLocator?: Locator;
    triggerTestId: string;
    contentTestId: string;
    searchTestId: string;
  }
) {
  const { triggerTestId, contentTestId, searchTestId, parentLocator } = config;
  const baseLocator = parentLocator ? parentLocator : page;
  const contentLocator = page.getByTestId(contentTestId);

  const trigger = baseLocator.getByTestId(triggerTestId);

  return {
    open: async () => {
      await trigger.click();
      await contentLocator.waitFor();
    },
    selectOption: async (value: string) => {
      await contentLocator.getByText(value).click();
    },
    search: async (text: string) => {
      await contentLocator.getByTestId(searchTestId).fill(text);
    },
    trigger: () => {
      return trigger;
    },
  };
}

/**
 * Finds an inline multi-select and returns a set of functions to interact with it
 *
 * @example
 * const inlineMultiSelect = findInlineMultiSelect(page, {
 *   triggerTestId: "inline-multi-select-trigger",
 *   contentTestId: "inline-multi-select-content",
 *   searchTestId: "inline-multi-select-search",
 *   getOptionSelector: (value) => `[data-testid="option-${value}"]`,
 * });
 * // select options
 * await inlineMultiSelect.open();
 * await inlineMultiSelect.selectOption("option-1");
 * await inlineMultiSelect.selectOption("option-2");
 * // search
 * await inlineMultiSelect.search("option");
 * // get trigger text
 * const trigger = inlineMultiSelect.trigger();
 * await trigger.textContent();
 */
export function findInlineMultiSelect(
  page: Page,
  config: {
    parentLocator?: Locator;
    triggerTestId: string;
    contentTestId: string;
    searchTestId: string;
  }
) {
  const { triggerTestId, contentTestId, searchTestId, parentLocator } = config;
  const baseLocator = parentLocator ? parentLocator : page;
  const contentLocator = page.getByTestId(contentTestId);

  const trigger = baseLocator.getByTestId(triggerTestId);

  return {
    open: async () => {
      await trigger.click();
      await contentLocator.waitFor();
    },
    selectOption: async (value: string) => {
      await contentLocator.getByText(value, { exact: true }).click();
    },
    selectAll: async () => {
      await contentLocator.getByTestId("input-radio-all").check();
    },
    search: async (text: string) => {
      await contentLocator.getByTestId(searchTestId).fill(text);
    },
    trigger: () => {
      return trigger;
    },
  };
}
