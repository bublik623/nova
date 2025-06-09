import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { defineComponent, ref, type PropType } from "vue";
import InlineMultiSelect from "../InlineMultiSelect.vue";
import NovaSelect from "@/ui-kit/NovaSelectPrimitive/NovaSelect.vue";
import NovaSelectTrigger from "@/ui-kit/NovaSelectPrimitive/NovaSelectTrigger.vue";
import NovaSelectDropdown from "@/ui-kit/NovaSelectPrimitive/NovaSelectDropdown.vue";
import NovaSelectOption from "@/ui-kit/NovaSelectPrimitive/NovaSelectOption.vue";
import { InlineMultiSelectFacade } from "./InlineMultiSelectFacade";
import type { BaseOption } from "@/types/Option";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

vi.mock("vue", async (importOriginal) => {
  // Import the actual Vue module
  const actualVue = await importOriginal<typeof import("vue")>();

  // Return an object containing all the original exports...
  return {
    ...actualVue,
    // ...but override useId with a simple mock function
    // This provides a predictable ID for testing purposes.
    useId: () => "test-mock-id",
  };
});

vi.mock("@floating-ui/vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@floating-ui/vue")>();
  return {
    ...actual, // Keep other exports like autoUpdate by default
    useFloating: vi.fn(() => ({
      // Mock the main useFloating function
      // Provide simple static styles instead of calculated ones
      floatingStyles: {
        position: "absolute",
        top: "10px", // Simple coordinates
        left: "10px",
        display: "block", // Crucial: Ensure it's not display: none
        visibility: "visible", // Crucial: Ensure it's not visibility: hidden
        // Add other basic styles if absolutely needed, but keep it simple
      },
      update: vi.fn(), // Mock the update function in case it's called
    })),
    // Mock autoUpdate as well, as it might also interact with elements/DOM
    autoUpdate: vi.fn(),
  };
});

const sampleOptions: BaseOption<string>[] = [
  { value: "opt1", label: "Option One" },
  { value: "opt2", label: "Option Two" },
  { value: "opt3", label: "Option Three (Case)" },
];

// Parent component to manage v-model and props for testing
const TestParent = defineComponent({
  name: "TestParent",
  components: { InlineMultiSelect },
  props: {
    initialModelValue: {
      type: [Array, String] as PropType<string[] | "all">,
      default: () => [],
    },
    options: { type: Array as () => BaseOption<string>[], default: () => sampleOptions },
  },
  setup(props) {
    const selected = ref<string[] | "all">(props.initialModelValue);
    return { selected };
  },
  template: `
    <div>
      <InlineMultiSelect
        :options="options"
        v-model:selectedValues="selected" data-testid="inline-select"
      />
      <div data-testid="parent-selected">{{ JSON.stringify(selected) }}</div>
    </div>
  `,
});

type TestParentProps = InstanceType<typeof TestParent>["$props"];

describe("InlineMultiSelect.vue", () => {
  let wrapper: VueWrapper<any>;
  let facade: InlineMultiSelectFacade<string>;

  const mountComponent = (props: Partial<TestParentProps> = {}) => {
    wrapper = mount(TestParent, {
      props,
      global: {
        components: {
          NovaSelect,
          NovaSelectTrigger,
          NovaSelectDropdown,
          NovaSelectOption,
        },
      },
      attachTo: document.body,
    });
    facade = new InlineMultiSelectFacade(wrapper);
  };

  beforeEach(() => {
    if (wrapper) wrapper.unmount();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  describe("Rendering & Initial State", () => {
    it("renders empty trigger label when no value selected", () => {
      mountComponent({ initialModelValue: [] });

      expect(facade.getTriggerLabel()).toBe("");
    });

    it("renders trigger with joined labels when subset selected", () => {
      mountComponent({ initialModelValue: ["opt1", "opt2"] });

      expect(facade.getTriggerLabel()).toBe("Option One, Option Two");
    });

    it('renders trigger with "All" when all selected initially', async () => {
      mountComponent({ initialModelValue: "all" });

      expect(facade.getTriggerLabel()).toBe("common.all");
    });

    it("dropdown content is initially hidden", () => {
      mountComponent();

      expect(facade.isDropdownOpen()).toBe(false);
    });
  });

  describe("Opening / Closing & Focus", () => {
    it("opens dropdown and focuses search input on trigger click", async () => {
      mountComponent();

      expect(facade.isDropdownOpen()).toBe(false);

      await facade.open();

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const searchInputWrapper = facade.searchInput; // Find the input wrapper

      expect(searchInputWrapper.exists()).toBe(true);

      expect(facade.isDropdownOpen()).toBe(true);
      expect(document.activeElement).toBe(facade.searchInput.element);
    });

    it("closes dropdown via click outside", async () => {
      mountComponent();

      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.clickOutside();
      expect(facade.isDropdownOpen()).toBe(false);
    });

    it("closes dropdown via Escape key", async () => {
      mountComponent();

      await facade.open();
      expect(facade.isDropdownOpen()).toBe(true);

      await facade.triggerEscapeKeydownOnSearchInput();
      expect(facade.isDropdownOpen()).toBe(false);
    });
  });

  describe("Search Functionality", () => {
    it("filters items based on search input", async () => {
      mountComponent({ initialModelValue: [] });

      await facade.open();
      await facade.searchFor("Two");

      expect(facade.getDisplayedItemLabels()).toEqual(["Option Two"]);
    });

    it("filter is case-insensitive", async () => {
      mountComponent({ initialModelValue: [] });

      await facade.open();
      await facade.searchFor("CASE");

      expect(facade.getDisplayedItemLabels()).toEqual(["Option Three (Case)"]);
    });
  });

  describe("Mode Selection (All/Specific Radios)", () => {
    it('initializes in "specific" mode if not all items selected', async () => {
      mountComponent({ initialModelValue: ["opt1"] });

      await facade.open();

      expect(facade.currentMode()).toBe("specific");
    });

    it('initializes in "all" mode if modelValue is "all"', async () => {
      mountComponent({ initialModelValue: "all" });

      await facade.open();

      expect(facade.currentMode()).toBe("all");
    });

    it('clicking "All" radio sets "all" mode and update selectedValues model to "all"', async () => {
      mountComponent({ initialModelValue: ["opt1"] });

      await facade.selectMode("specific");
      expect(facade.parentSelectedValue()).toStrictEqual(["opt1"]);

      const multiSelectVm = wrapper.findComponent({ name: "InlineMultiSelect" }).vm;
      console.log(
        "[Test Before Open] vm.selectedOptionsValues:",
        JSON.stringify(multiSelectVm.selectedOptionsValues),
        "isArray:",
        Array.isArray(multiSelectVm.selectedOptionsValues)
      );

      await facade.open();

      await facade.selectMode("all");

      expect(facade.currentMode()).toBe("all");

      // expect(facade.getLastEmittedValue("update:selectedValues")).toBe("all");
      expect(facade.parentSelectedValue()).toBe("all");
      expect(facade.getTriggerLabel()).toBe("common.all");

      // Options are not explicitly selected in "all" mode
      expect(facade.isOptionSelected("opt1")).toBe(false);
      expect(facade.isOptionSelected("opt2")).toBe(false);
      expect(facade.isOptionSelected("opt3")).toBe(false);
    });

    it('clicking "Specific" radio sets to "specific" mode and update selectedValues model to []]', async () => {
      mountComponent({ initialModelValue: "all" });

      await facade.open();

      await facade.selectMode("specific");

      expect(facade.currentMode()).toBe("specific");

      expect(facade.parentSelectedValue()).toEqual([]);
      expect(facade.getTriggerLabel()).toBe("");

      expect(facade.isOptionSelected("opt1")).toBe(false);
      expect(facade.isOptionSelected("opt2")).toBe(false);
      expect(facade.isOptionSelected("opt3")).toBe(false);
    });

    it('selecting a single item when "All" mode is active, sets "specific" mode and updates model to only that item', async () => {
      mountComponent({ initialModelValue: "all" });

      await facade.open();

      await facade.checkOption("opt1");

      expect(facade.currentMode()).toBe("specific");

      expect(facade.parentSelectedValue()).toEqual(["opt1"]);

      expect(facade.isOptionSelected("opt1")).toBe(true);
      expect(facade.isOptionSelected("opt2")).toBe(false);
      expect(facade.isOptionSelected("opt3")).toBe(false);

      expect(facade.getTriggerLabel()).toBe("Option One");
    });
  });

  describe("Multi-Selection (Checkboxes in Specific Mode)", () => {
    beforeEach(async () => {
      mountComponent({ initialModelValue: ["opt1"] });
      await facade.open();
    });

    it("checkboxes reflect initial modelValue", () => {
      expect(facade.isOptionSelected("opt1")).toBe(true);
      expect(facade.isOptionSelected("opt2")).toBe(false);
      expect(facade.isOptionSelected("opt3")).toBe(false);
    });

    it("checking an item updates modelValue and does not close dropdown", async () => {
      await facade.checkOption("opt2");

      expect(facade.isOptionSelected("opt2")).toBe(true);
      expect(facade.isOptionSelected("opt3")).toBe(false);

      expect(facade.isDropdownOpen()).toBe(true);
    });

    it("unchecking an item updates modelValue and does not close dropdown", async () => {
      await facade.checkOption("opt2");

      await facade.uncheckOption("opt1");

      expect(facade.isOptionSelected("opt1")).toBe(false);
      expect(facade.isOptionSelected("opt2")).toBe(true);
      expect(facade.isOptionSelected("opt3")).toBe(false);

      expect(facade.isDropdownOpen()).toBe(true);
    });
  });

  describe("v-model Binding", () => {
    it("updates internal state when modelValue prop changes externally", async () => {
      mountComponent({ initialModelValue: ["opt1"] });
      expect(facade.getTriggerLabel()).toBe("Option One");

      wrapper.vm.selected = "all";

      await facade.open();

      expect(facade.currentMode()).toBe("all");
      expect(facade.getTriggerLabel()).toBe("common.all");

      expect(facade.isOptionSelected("opt1")).toBe(false);
      expect(facade.isOptionSelected("opt2")).toBe(false);
      expect(facade.isOptionSelected("opt3")).toBe(false);
    });
  });
});
