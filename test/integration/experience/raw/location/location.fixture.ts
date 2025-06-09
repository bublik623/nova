import { Page } from "@playwright/test";
import { testId } from "@/utils/test.utils";

export class ExperienceLocationPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  findFieldCity() {
    return findFieldCity(this.page);
  }

  findMeetingPoint() {
    return findTextEditor(this.page, "location-meeting-point");
  }

  findAddress() {
    return findFieldPlace(this.page, "field-address-input-text");
  }

  findMap() {
    return findMap(this.page, "field-map");
  }

  findFieldAdditionalCities() {
    return findFieldMultiSelect(this.page, {
      inputTestId: "field-additional-cities-input",
      optionTestId: "option-label",
      selectedItemTestId: "field-additional-cities-selected-item",
      selectedCountTestId: "field-additional-cities-selected-text",
    });
  }

  findFieldAdditionalCitiesList() {
    return findFieldMultiSelectList(this.page, {
      listTestId: "field-selected-additional-cities",
      listItemTestId: "list-item",
      removeButtonTestId: "button-remove-city",
    });
  }

  findFieldVenues() {
    return findFieldMultiSelect(this.page, {
      inputTestId: "field-venues-input",
      optionTestId: "option-label",
      selectedItemTestId: "field-venues-selected-item",
      selectedCountTestId: "field-venues-selected-text",
    });
  }

  findFieldVenuesList() {
    return findFieldMultiSelectList(this.page, {
      listTestId: "field-selected-venues",
      listItemTestId: "list-item",
      removeButtonTestId: "button-remove-item",
    });
  }

  findSaveDraftButton() {
    return this.page.locator(testId("document-action-bar-save-content"));
  }
}

export function findFieldCity(page: Page) {
  return {
    selectOption: async (index: number) => {
      await page.locator(testId("city-select-input")).click();
      return page.locator(testId("city-select-item")).nth(index).click();
    },
    selectedCity: () => {
      return page.locator(testId("city-select-label")).innerText();
    },
    clear: async () => {
      return await page.locator(testId("city-select-clear")).click();
    },
  };
}

export function findTextEditor(page: Page, editorTestId: string) {
  const editor = page.locator(testId(editorTestId));
  return {
    text: async () => {
      return editor.innerText();
    },
    type: (value: string) => {
      return editor.locator(".ProseMirror").type(value);
    },
  };
}

export function findFieldPlace(page: Page, componentTestId: string) {
  return {
    inputValue: () => {
      return page.locator(testId(componentTestId)).inputValue();
    },
  };
}

export function findMap(page: Page, id: string) {
  return page.locator(`#${id}`);
}

export function findFieldMultiSelect(
  page: Page,
  config: {
    inputTestId: string;
    optionTestId: string;
    selectedItemTestId: string;
    selectedCountTestId: string;
  }
) {
  const { inputTestId, optionTestId, selectedItemTestId, selectedCountTestId } = config;

  const selectOption = async (index: number) => {
    await page.locator(testId(inputTestId)).click();
    await page.locator(testId(optionTestId)).nth(index).click();
  };

  const closeDropdown = async () => {
    await page.mouse.click(0, 0);
  };

  const selectedOptions = async () => {
    const selectedItems = page.locator(testId(selectedItemTestId));
    const count = await selectedItems.count();
    const options = [];
    for (let i = 0; i < count; i++) {
      options.push(await selectedItems.nth(i).innerText());
    }
    return options;
  };

  const selectedText = async () => {
    await page.locator(testId(inputTestId)).click();
    const text = await page.locator(testId(selectedCountTestId)).innerText();
    await closeDropdown();
    return text;
  };

  return { selectOption, closeDropdown, selectedOptions, selectedText };
}

export function findFieldMultiSelectList(
  page: Page,
  config: {
    listTestId: string;
    listItemTestId: string;
    removeButtonTestId: string;
  }
) {
  const { listTestId, listItemTestId, removeButtonTestId } = config;
  return {
    isVisible: async () => {
      return await page.locator(testId(listTestId)).isVisible();
    },
    selectedItems: async () => {
      const listItems = page.locator(testId(listTestId)).locator(testId(listItemTestId));
      const count = await listItems.count();
      const items = [];
      for (let i = 0; i < count; i++) {
        const item = listItems.nth(i);
        const itemName = await item.locator("span").first().innerText();
        const itemDescription = await item.locator("span").nth(1).innerText();
        items.push({ name: itemName, description: itemDescription });
      }
      return items;
    },
    removeItem: async (index: number) => {
      const removeButtons = page.locator(testId(removeButtonTestId));
      await removeButtons.nth(index).click();
    },
  };
}
