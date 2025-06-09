import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { defineComponent, ref, type PropType, nextTick } from "vue";
import InlineSingleSelect from "../InlineSingleSelect.vue";
import NovaSelect from "@/ui-kit/NovaSelectPrimitive/NovaSelect.vue";
import NovaSelectTrigger from "@/ui-kit/NovaSelectPrimitive/NovaSelectTrigger.vue";
import NovaSelectDropdown from "@/ui-kit/NovaSelectPrimitive/NovaSelectDropdown.vue";
import NovaSelectOption from "@/ui-kit/NovaSelectPrimitive/NovaSelectOption.vue";
import { InlineSingleSelectFacade } from "./InlineSingleSelectFacade";
import type { BaseOption } from "@/types/Option";

// Mock useNuxtApp
vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s, // Simple translation mock
}));

// Mock @floating-ui/vue (aligned with the static multi-select mock)
vi.mock("@floating-ui/vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@floating-ui/vue")>();
  return {
    ...actual,
    useFloating: vi.fn(() => ({
      floatingStyles: {
        position: "absolute",
        top: "10px",
        left: "10px",
        display: "block", // Always block
        visibility: "visible", // Always visible
      },
      update: vi.fn(),
    })),
    autoUpdate: vi.fn(),
  };
});

const sampleOptions: BaseOption<string>[] = [
  { value: "opt1", label: "Option One" },
  { value: "opt2", label: "Option Two" },
  { value: "opt3", label: "Option Three (Special)" },
  { value: "opt4", label: "Another Option" },
];

const sampleNumericOptions: BaseOption<number>[] = [
  { value: 100, label: "Numeric OneHundred" },
  { value: 200, label: "Numeric TwoHundred" },
];

// Parent component to manage v-model and props for testing
const TestParent = defineComponent({
  name: "TestParentSingle",
  components: { InlineSingleSelect },
  props: {
    initialModelValue: {
      type: [String, Number, undefined] as PropType<string | number | undefined>,
      default: undefined,
    },
    options: {
      type: Array as () => BaseOption<string | number>[],
      default: () => [...sampleOptions], // Use a copy
    },
  },
  setup(props) {
    const selected = ref<string | number | undefined>(props.initialModelValue);
    const currentOptions = ref(props.options); // Make options reactive if needed for tests
    return { selected, currentOptions };
  },
  template: `
    <div>
      <InlineSingleSelect
        :options="currentOptions"
        v-model:selectedValue="selected"
        data-testid="inline-select"
      />
      <div data-testid="parent-selected">{{ selected === undefined ? 'undefined' : JSON.stringify(selected) }}</div>
    </div>
  `,
});

type TestParentProps = InstanceType<typeof TestParent>["$props"];

describe("InlineSingleSelect.vue", () => {
  let wrapper: VueWrapper<any>;
  let facade: InlineSingleSelectFacade<string | number>;

  const mountComponent = (props: Partial<TestParentProps> = {}) => {
    // Ensure options are fresh for each mount if they can be mutated by component
    const testProps = {
      options: props.options ? [...props.options] : [...sampleOptions],
      ...props,
    };

    wrapper = mount(TestParent, {
      props: testProps,
      global: {
        components: {
          NovaSelect,
          NovaSelectTrigger,
          NovaSelectDropdown,
          NovaSelectOption,
        },
        stubs: {
          NovaIcon: { template: '<svg data-testid="mock-icon"></svg>' },
        },
      },
      attachTo: document.body,
    });
    facade = new InlineSingleSelectFacade(wrapper);
  };

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks(); // Restore mocks if they were modified per test
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    // Clean up any teleported elements manually
    const portalContent = document.body.querySelector('[data-testid="inline-select-content"]');
    if (portalContent) portalContent.remove();
  });

  describe("Rendering & Initial State", () => {
    it("renders empty trigger label when no value selected", () => {
      mountComponent({ initialModelValue: undefined });
      expect(facade.getTriggerLabel()).toBe("");
    });

    it("renders trigger with the correct label when a value is selected initially", () => {
      mountComponent({ initialModelValue: "opt1" });
      expect(facade.getTriggerLabel()).toBe("Option One");
    });

    it("renders trigger with the correct label for numeric value when selected initially", () => {
      mountComponent({ initialModelValue: 100, options: [...sampleNumericOptions] });
      expect(facade.getTriggerLabel()).toBe("Numeric OneHundred");
    });

    it("dropdown content is initially hidden/not open based on facade logic", () => {
      mountComponent();
      expect(facade.isDropdownOpen()).toBe(false);
    });
  });

  describe("Opening / Closing & Focus", () => {
    it("opens dropdown, shows search input, and focuses search input on trigger click", async () => {
      mountComponent();
      expect(facade.isDropdownOpen()).toBe(false); // Initially closed

      await facade.open();

      await nextTick(); // Allow for focus and other async updates
      await nextTick();

      expect(facade.isDropdownOpen()).toBe(true); // Should be open
      const searchInputWrapper = facade.searchInput;
      expect(searchInputWrapper?.exists()).toBe(true);
      expect(document.activeElement).toBe(searchInputWrapper?.element);
    });

    it("closes dropdown when an option is selected", async () => {
      mountComponent({ initialModelValue: undefined });
      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.selectOptionItem("opt1");
      await nextTick(); // Extra tick for state propagation

      expect(facade.isDropdownOpen()).toBe(false);
      expect(facade.parentSelectedValue()).toBe("opt1");
    });

    it("closes dropdown via click outside", async () => {
      mountComponent();
      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.clickOutside();
      await nextTick();
      expect(facade.isDropdownOpen()).toBe(false);
    });

    it("closes dropdown via Escape key", async () => {
      mountComponent();
      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.triggerEscapeKeydown();
      await nextTick();
      expect(facade.isDropdownOpen()).toBe(false);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(async () => {
      mountComponent({ initialModelValue: undefined });
      await facade.open();
    });

    it("filters items based on search input", async () => {
      await facade.searchFor("Two");
      expect(facade.getDisplayedItemLabels()).toEqual(["Option Two"]);
    });

    it("filter is case-insensitive", async () => {
      await facade.searchFor("option three");
      expect(facade.getDisplayedItemLabels()).toEqual(["Option Three (Special)"]);
    });

    it("shows all options when search is cleared", async () => {
      await facade.searchFor("Two");
      expect(facade.getDisplayedItemLabels()).toEqual(["Option Two"]); // Verify intermediate step

      await facade.searchFor(""); // Clear search
      expect(facade.getDisplayedItemLabels()).toEqual(sampleOptions.map((o) => o.label));
    });

    it("returns empty list if no options match search", async () => {
      await facade.searchFor("NonExistentSearchTerm");
      expect(facade.getDisplayedItemLabels()).toEqual([]);
    });
  });

  describe("Selection Logic", () => {
    it("initially reflects the selectedValue in the trigger if opened and closed", async () => {
      mountComponent({ initialModelValue: "opt1" });
      expect(facade.getTriggerLabel()).toBe("Option One"); // Check initial render

      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);
      await facade.trigger?.trigger("click"); // Click trigger to close
      await nextTick();
      expect(facade.isDropdownOpen()).toBe(false);
      expect(facade.getTriggerLabel()).toBe("Option One");
    });

    it("selecting an item updates modelValue, trigger label, and closes dropdown", async () => {
      mountComponent({ initialModelValue: "opt1" });
      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.selectOptionItem("opt2"); // Facade calls nextTick
      await nextTick(); // Allow events and updates to propagate

      expect(facade.parentSelectedValue()).toBe("opt2");
      expect(facade.getTriggerLabel()).toBe("Option Two");
      expect(facade.isDropdownOpen()).toBe(false);
    });

    it("selecting another item changes the selection, updates model/trigger, and closes dropdown", async () => {
      mountComponent({ initialModelValue: "opt1" });
      await facade.open();
      await facade.selectOptionItem("opt3");
      await nextTick();

      expect(facade.parentSelectedValue()).toBe("opt3");
      expect(facade.getTriggerLabel()).toBe("Option Three (Special)");
      expect(facade.isDropdownOpen()).toBe(false);

      await facade.open(); // Re-open to select another
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.selectOptionItem("opt4");
      await nextTick();

      expect(facade.parentSelectedValue()).toBe("opt4");
      expect(facade.getTriggerLabel()).toBe("Another Option");
      expect(facade.isDropdownOpen()).toBe(false);
    });

    it("selecting an item with numeric value updates modelValue and closes dropdown", async () => {
      mountComponent({ initialModelValue: undefined, options: [...sampleNumericOptions] });
      await facade.open();

      await facade.selectOptionItem(100); // Select numeric value
      await nextTick();

      expect(facade.parentSelectedValue()).toBe(100);
      expect(facade.getTriggerLabel()).toBe("Numeric OneHundred");
      expect(facade.isDropdownOpen()).toBe(false);
    });
  });

  describe("v-model Binding (selectedValue)", () => {
    it("updates trigger label when modelValue prop changes externally", async () => {
      mountComponent({ initialModelValue: "opt1" });
      expect(facade.getTriggerLabel()).toBe("Option One");

      await wrapper.setProps({ initialModelValue: "opt2" }); // Test parent needs to react to this prop change
      wrapper.vm.selected = "opt2"; // More direct model change simulation on parent
      await nextTick();

      expect(facade.getTriggerLabel()).toBe("Option Two");
      expect(facade.parentSelectedValue()).toBe("opt2");
    });

    it("updates trigger label to empty when modelValue prop changes externally to undefined", async () => {
      mountComponent({ initialModelValue: "opt1" });
      expect(facade.getTriggerLabel()).toBe("Option One");

      wrapper.vm.selected = undefined;
      await nextTick();

      expect(facade.getTriggerLabel()).toBe("");
      expect(facade.parentSelectedValue()).toBeUndefined();
    });

    it("updates internal selection state if dropdown is open and modelValue changes externally, then selection works", async () => {
      mountComponent({ initialModelValue: "opt1" });
      await facade.open();

      wrapper.vm.selected = "opt2"; // External change
      await nextTick();

      expect(facade.parentSelectedValue()).toBe("opt2");

      await facade.selectOptionItem("opt3"); // Select a new option from dropdown
      await nextTick();

      expect(facade.parentSelectedValue()).toBe("opt3");
      expect(facade.getTriggerLabel()).toBe("Option Three (Special)");
      expect(facade.isDropdownOpen()).toBe(false);
    });
  });
});
