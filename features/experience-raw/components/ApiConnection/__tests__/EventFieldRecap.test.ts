import { config, mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";
import EventFieldRecap from "../EventFieldRecap.vue";
const eventMock = {
  title: "Test Event",
  code: "1234",
};

const mountComponent = (props = {}) => {
  return mount(EventFieldRecap, {
    props: {
      event: eventMock,
      readonly: false,
      ...props,
    },
  });
};

const $tMock = vi.fn((s: string) => s);

vi.stubGlobal("useNuxtApp", () => ({
  $t: $tMock,
}));

config.global.mocks = {
  $t: $tMock,
};

const selectors = {
  editButton: '[data-testid="raw-event-selection-field-edit"]',
  removeButton: '[data-testid="raw-event-selection-field-remove"]',
};

describe("EventFieldRecap", () => {
  it('renders "NoContentUtil" if no event is provided', () => {
    const wrapper = mountComponent({ event: undefined });

    expect(wrapper.findComponent(NoContentUtil).exists()).toBe(true);
    expect(wrapper.text()).toContain("raw-event-selection-field-no-event-placeholder");
  });

  it("displays event details when event is provided", () => {
    const wrapper = mountComponent();

    expect(wrapper.findComponent(NoContentUtil).exists()).toBe(false);
    expect(wrapper.text()).toContain("Test Event");
    expect(wrapper.text()).toContain("1234");
  });

  it("shows the edit button if not readonly and event is present", () => {
    const wrapper = mountComponent();

    expect(wrapper.find(selectors.editButton).isVisible()).toBe(true);
  });
  it('emits "click-action:edit" when the edit button is clicked', async () => {
    const wrapper = mountComponent();

    await wrapper.find(selectors.editButton).trigger("click");

    expect(wrapper.emitted("click-action:edit")).toBeTruthy();
  });

  it("hides the edit button if readonly is true", () => {
    const wrapper = mountComponent({ readonly: true });
    expect(wrapper.find(selectors.editButton).exists()).toBe(false);
  });

  it("shows the remove button if not readonly and event is present", () => {
    const wrapper = mountComponent();

    expect(wrapper.find(selectors.removeButton).isVisible()).toBe(true);
  });

  it('emits "click-action:remove" when the remove button is clicked', async () => {
    const wrapper = mountComponent();

    await wrapper.find(selectors.removeButton).trigger("click");

    expect(wrapper.emitted("click-action:remove")).toBeTruthy();
  });
});
