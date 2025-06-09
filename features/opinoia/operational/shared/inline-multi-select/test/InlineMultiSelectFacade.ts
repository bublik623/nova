import { VueWrapper, DOMWrapper } from "@vue/test-utils";

// Helper function to create DOMWrapper (if needed and possible)
// Note: Manually creating DOMWrapper might depend on test-utils version and isn't always stable API.
// It's often safer to return the element and check it directly, or use wrapper.find if possible.
// However, since we MUST bypass wrapper.find for teleported elements, we try this or return null.
export function tryWrapElement<T extends Element>(element: T | null): DOMWrapper<T> | null {
  if (!element) {
    return null;
  }
  try {
    // This constructor usage might be internal API - use with caution
    return new DOMWrapper<T>(element);
  } catch (e) {
    console.error("Failed to create DOMWrapper manually.", e);
    // Fallback or throw, depending on desired strictness
    return null;
  }
}

export class InlineMultiSelectFacade<TValue extends PropertyKey> {
  constructor(private wrapper: VueWrapper<any>) {}

  // --- Element Finders ---

  get trigger(): DOMWrapper<HTMLElement> | null {
    // Trigger is NOT teleported, wrapper.find is okay
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

  /**
   * Finds a specific radio button for mode selection ('all' or 'specific').
   * Relies on the useId mock providing 'test-mock-id'.
   */
  getModeRadio(mode: "all" | "specific"): DOMWrapper<HTMLInputElement> | null {
    // Radios ARE teleported
    // Assumes the name attribute format is `${id}-selection-mode` and id is mocked to 'test-mock-id'
    const selector = `input[type='radio'][data-testid='input-radio-${mode}']`;
    return tryWrapElement(document.body.querySelector<HTMLInputElement>(selector));
  }

  /**
   * Finds the main container element for a specific option.
   */
  getOptionItem(value: TValue): DOMWrapper<HTMLElement> | null {
    // Options ARE teleported
    const selector = `[data-testid="option-item-${String(value)}"]`;
    return tryWrapElement(document.body.querySelector<HTMLElement>(selector));
  }

  /**
   * Finds the specific span holding the option's visible label text.
   * Assumes the span has data-testid="option-label".
   */
  getOptionLabelElement(value: TValue): DOMWrapper<HTMLSpanElement> | null {
    const optionItem = this.getOptionItem(value);
    // Query within the specific option item's element if found
    const element = optionItem?.element.querySelector<HTMLSpanElement>('[data-testid="option-label"]');
    return tryWrapElement(element ?? null);
  }

  /**
   * Finds the checkbox input element for a specific option.
   */
  getOptionCheckbox(value: TValue): DOMWrapper<HTMLInputElement> | null {
    // Checkboxes ARE teleported - find the specific input element
    // Using the id derived from the label's 'for' or the input's value/id itself
    // Let's use the data-testid added to NovaCheckbox span and find input within it
    const checkboxWrapperSpan = tryWrapElement(
      document.body.querySelector<HTMLSpanElement>(`[data-testid="option-checkbox-${String(value)}"]`)
    );
    const inputElement = checkboxWrapperSpan?.element.querySelector<HTMLInputElement>('input[type="checkbox"]');
    return tryWrapElement(inputElement ?? null);
  }

  // --- Actions ---

  /**
   * Opens the dropdown by clicking the trigger.
   */
  async open() {
    await this.trigger?.trigger("click");
    await nextTick();
  }

  /**
   * Types into the search input and triggers the input event.
   */
  async searchFor(term: string) {
    const inputWrapper = this.searchInput;
    if (inputWrapper) {
      await inputWrapper.setValue(term);
      await inputWrapper.trigger("input"); // Crucial: trigger event
    } else {
      console.error("Cannot search: Search input not found.");
      throw new Error("Search input not found");
    }
    // Remember to await nextTick() in the test after calling searchFor()
  }

  /**
   * Selects the 'All' or 'Specific' mode radio button.
   */
  async selectMode(mode: "all" | "specific") {
    const radioWrapper = this.getModeRadio(mode);
    if (radioWrapper) {
      if (!Object.hasOwn(radioWrapper.attributes(), "checked")) {
        await radioWrapper.trigger("click");
        await nextTick();
      }
    } else {
      console.error(`Cannot select mode: Radio button for ${mode} not found.`);
      throw new Error(`Radio button for ${mode} not found.`);
    }
    // Remember to await nextTick() in the test after calling selectMode()
  }

  /**
   * Toggles the selection of a specific option by clicking its item container.
   */
  async toggleOption(value: TValue) {
    const itemWrapper = this.getOptionItem(value);
    if (itemWrapper) {
      await itemWrapper.trigger("click");
    } else {
      console.error(`Cannot toggle option: Item for value ${String(value)} not found.`);
      throw new Error(`Option item for value ${String(value)} not found.`);
    }
    // Remember to await nextTick() in the test after calling toggleOption()
  }

  async checkOption(value: TValue) {
    if (!this.isOptionSelected(value)) {
      await this.toggleOption(value);
    }
  }

  async uncheckOption(value: TValue) {
    if (this.isOptionSelected(value)) {
      await this.toggleOption(value);
    }
  }

  /** Clicks outside - assumes clicking the parent wrapper is sufficient */
  async clickOutside() {
    await this.wrapper.trigger("click"); // Or trigger on document.body if needed
  }

  /** Triggers escape key on search input */
  async triggerEscapeKeydownOnSearchInput() {
    await this.searchInput?.trigger("keydown", { key: "Escape" });
  }

  // --- State Checks ---

  /**
   * Checks if the dropdown appears open (checks for search input existence and visibility).
   */
  isDropdownOpen(): boolean {
    const searchInputWrapper = this.searchInput;
    // Relies on useFloating mock providing visible styles
    return !!searchInputWrapper?.exists() && !!searchInputWrapper?.isVisible();
  }

  /**
   * Gets the text content of the trigger button.
   */
  getTriggerLabel(): string {
    return this.trigger?.text() ?? "";
  }

  /**
   * Gets the labels of the currently displayed options.
   * Assumes option label spans have data-testid="option-label".
   */
  getDisplayedItemLabels(): string[] {
    // Find all root option elements (adjust selector if needed, e.g. the element with data-testid^="option-item-")
    const optionElements = document.body.querySelectorAll<HTMLElement>('[data-testid^="option-item-"]');
    const labels: string[] = [];
    optionElements.forEach((el) => {
      const labelSpan = el.querySelector<HTMLSpanElement>('[data-testid="option-label"]');
      if (labelSpan?.textContent) {
        // Check textContent directly
        labels.push(labelSpan.textContent.trim());
      }
    });
    return labels;
  }

  /**
   * Checks if a specific option's checkbox is currently checked.
   */
  isOptionSelected(value: TValue): boolean {
    const checkboxInputWrapper = this.getOptionCheckbox(value); // Gets the input DOMWrapper

    // Check if the wrapper and element exist before trying to get the attribute
    if (!checkboxInputWrapper?.element) {
      // Log a warning if the input element itself couldn't be found
      console.warn(`[isOptionSelected] Checkbox INPUT for value ${String(value)} not found.`);
      return false;
    }

    // Check the aria-checked attribute DIRECTLY on the input element
    return checkboxInputWrapper.element.getAttribute("aria-checked") === "true";
  }

  /**
   * Gets the currently selected mode ('all' or 'specific') from the radio group.
   */
  currentMode(): "all" | "specific" | "unknown" {
    const allRadio = this.getModeRadio("all");
    const specificRadio = this.getModeRadio("specific");

    if ((allRadio?.element as HTMLInputElement)?.checked) {
      return "all";
    }
    if ((specificRadio?.element as HTMLInputElement)?.checked) {
      return "specific";
    }
    return "unknown";
  }

  // --- Test Helpers ---

  /**
   * Gets the last emitted value for a specific event.
   */
  getLastEmittedValue(eventName: string): any | undefined {
    const emissions = this.wrapper.emitted(eventName);
    if (!emissions || emissions.length === 0) {
      return undefined;
    }
    // Return the first argument of the last emission
    return emissions[emissions.length - 1][0];
  }

  /** Reads selected value shown in parent for testing v-model binding */
  parentSelectedValue(): any {
    const parentSelectedDiv = this.wrapper.find('[data-testid="parent-selected"]');
    try {
      return JSON.parse(parentSelectedDiv.text());
    } catch (e) {
      console.error("Could not parse parent selected value", e);
      return parentSelectedDiv.text(); // Return raw text if JSON fails
    }
  }
}
