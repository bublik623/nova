import { VueWrapper, DOMWrapper } from "@vue/test-utils";

// Helper function to create DOMWrapper (if needed and possible)
export function tryWrapElement<T extends Element>(element: T | null): DOMWrapper<T> | null {
  if (!element) {
    return null;
  }
  try {
    return new DOMWrapper<T>(element);
  } catch (e) {
    console.error("Failed to create DOMWrapper manually.", e);
    return null;
  }
}

export class InlineSingleSelectFacade<TValue extends PropertyKey> {
  constructor(private wrapper: VueWrapper<any>) {}

  // --- Element Finders ---

  get trigger(): DOMWrapper<HTMLElement> | null {
    const el = this.wrapper.find<HTMLElement>('[data-testid="inline-select-trigger"]');
    return el.exists() ? el : null;
  }

  get dropdownContent(): DOMWrapper<HTMLElement> | null {
    // Dropdown IS teleported
    return tryWrapElement(document.body.querySelector<HTMLElement>('[data-testid="inline-select-content"]'));
  }

  get searchInput(): DOMWrapper<HTMLInputElement> | null {
    // Search input IS teleported
    return tryWrapElement(document.body.querySelector<HTMLInputElement>('[data-testid="inline-select-search"]'));
  }

  getOptionItem(value: TValue): DOMWrapper<HTMLElement> | null {
    // Options ARE teleported
    const selector = `[data-testid="option-item-${String(value)}"]`;
    return tryWrapElement(document.body.querySelector<HTMLElement>(selector));
  }

  getOptionLabelElement(value: TValue): DOMWrapper<HTMLSpanElement> | null {
    const optionItem = this.getOptionItem(value);
    const element = optionItem?.element.querySelector<HTMLSpanElement>('[data-testid="option-label"]');
    return tryWrapElement(element ?? null);
  }

  // --- Actions ---

  async open() {
    await this.trigger?.trigger("click");
    await nextTick(); // Allow dropdown to render
  }

  async searchFor(term: string) {
    const inputWrapper = this.searchInput;
    if (inputWrapper && inputWrapper.exists()) {
      await inputWrapper.setValue(term);
      await inputWrapper.trigger("input"); // Explicitly trigger 'input' event
    } else {
      console.error("Cannot search: Search input not found or does not exist.");
      throw new Error("Search input not found");
    }
    await nextTick(); // Allow filtering to apply
  }

  async selectOptionItem(value: TValue) {
    const itemWrapper = this.getOptionItem(value);
    if (itemWrapper && itemWrapper.exists()) {
      await itemWrapper.trigger("click");
    } else {
      console.error(`Cannot select option: Item for value ${String(value)} not found.`);
      throw new Error(`Option item for value ${String(value)} not found.`);
    }
    await nextTick(); // Allow selection to process and dropdown to potentially close
  }

  /** Clicks outside - assumes clicking the parent wrapper is sufficient */
  async clickOutside() {
    await this.wrapper.trigger("click");
  }

  async triggerEscapeKeydown() {
    await this.searchInput?.trigger("keydown", { key: "Escape" });
  }

  // --- State Checks ---

  isDropdownOpen(): boolean {
    // Aligned with InlineMultiSelectFacade's strategy:
    // Relies on the search input being present and visible within the dropdown.
    const searchInputWrapper = this.searchInput;
    return !!searchInputWrapper?.exists() && !!searchInputWrapper?.isVisible();
  }

  getTriggerLabel(): string {
    return this.trigger?.text() ?? "";
  }

  getDisplayedItemLabels(): string[] {
    // Aligned with InlineMultiSelectFacade: no el.offsetParent check.
    // Assumes v-for correctly adds/removes items from DOM based on matchingOptions.
    const optionElements = document.body.querySelectorAll<HTMLElement>('[data-testid^="option-item-"]');
    const labels: string[] = [];
    optionElements.forEach((el) => {
      const labelSpan = el.querySelector<HTMLSpanElement>('[data-testid="option-label"]');
      if (labelSpan?.textContent) {
        labels.push(labelSpan.textContent.trim());
      }
    });
    return labels;
  }

  isOptionValueSelected(value: TValue): boolean {
    const currentSelected = this.parentSelectedValue();
    return currentSelected === value;
  }

  // --- Test Helpers ---

  getLastEmittedValue(eventName: string): any | undefined {
    const emissions = this.wrapper.emitted(eventName);
    if (!emissions || emissions.length === 0) {
      return undefined;
    }
    return emissions[emissions.length - 1][0];
  }

  parentSelectedValue(): any {
    const parentSelectedDiv = this.wrapper.find('[data-testid="parent-selected"]');
    if (!parentSelectedDiv.exists()) return undefined;
    const text = parentSelectedDiv.text();
    try {
      if (text === "undefined") return undefined;
      if (text === "null") return null; // Though model is undefined, not null
      if (text.startsWith('"') || text.startsWith("{") || text.startsWith("[")) {
        return JSON.parse(text);
      }
      if (!isNaN(parseFloat(text)) && isFinite(Number(text))) {
        return parseFloat(text);
      }
      return text;
    } catch (e) {
      return text;
    }
  }
}
