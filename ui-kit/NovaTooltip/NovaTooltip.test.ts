import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import NovaTooltip from "./NovaTooltip.vue";

// Create a helper function to set up the wrapper with the necessary setup for Teleport
function createWrapper() {
  return mount(NovaTooltip, {
    props: {
      position: "top",
      theme: "light",
    },
    slots: {
      default: "<button>Hover me</button>",
      content: "Tooltip content",
    },
    attachTo: document.body, // Attach to the document body to handle Teleport
  });
}

describe("NovaTooltip.vue", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it("renders the default slot content", () => {
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.find("button").text()).toBe("Hover me");
  });

  it("shows the tooltip on mouse enter", async () => {
    await wrapper.find('[data-testid="nova-tooltip"]').trigger("mouseenter");
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[data-testid="nova-tooltip-tip"]')).toBeTruthy();
  });

  it("hides the tooltip on mouse leave", async () => {
    await wrapper.find('[data-testid="nova-tooltip"]').trigger("mouseenter");
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-testid="nova-tooltip"]').trigger("mouseleave");
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[data-testid="nova-tooltip-tip"]')).toBeFalsy();
  });

  it("applies the correct theme class", async () => {
    await wrapper.find('[data-testid="nova-tooltip"]').trigger("mouseenter");
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[data-testid="nova-tooltip-tip"]')!.getAttribute("theme")).toBe("light");
  });

  it("changes the theme correctly", async () => {
    await wrapper.setProps({ theme: "dark" });
    await wrapper.find('[data-testid="nova-tooltip"]').trigger("mouseenter");
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[data-testid="nova-tooltip-tip"]')!.getAttribute("theme")).toBe("dark");
  });

  // Clean up the DOM after each test to prevent Teleport issues
  afterEach(() => {
    wrapper.unmount();
  });
});
