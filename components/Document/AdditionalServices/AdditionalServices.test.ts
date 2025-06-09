import { config, mount, shallowMount } from "@vue/test-utils";
import { test, expect, describe, vi } from "vitest";
import AdditionalServices, { Props } from "./AdditionalServices.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const props: Props = {
  id: "test-id",
  loading: false,
  additionalServices: [
    {
      id: "first-service",
      code: "FRE_CANCELLATION",
      name: "Fee Cancellation",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "7c531efc-ec15-45e2-a9be-3e9a2fbe0865",
      code: "FREE_DRINK",
      name: "Free Drink",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "7c531efc-ec15-45e2-a9be-3e9a2fbe0866",
      code: "FEE_CANCELLATION",
      name: "Free Breakfast",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "7c531efc-ec15-45e2-a9be-3e4a2fbe0864",
      code: "FEE_CANCELLATION",
      name: "Swimming Pool",
      description: "Description if it needs",
      language_code: "en",
    },
    {
      id: "7c531efc-ec15-45e2-a9be-399a2fbe0864",
      code: "FEE_CANCELLATION",
      name: "Airport Bus",
      description: "Description if it needs",
      language_code: "en",
    },
  ],
  modelValue: [],
  readonly: false,
};

const selectors = {
  button: "[data-testid='test-id-button']",
  title: "[data-testid='test-id-title']",
  description: "[data-testid='test-id-description']",
  skeleton: "[data-testid='test-id-skeleton']",
  list: "[data-testid='options-list-list']",
  listItem: "[data-testid^='options-list-list-item-']",
  clearBtn: "[data-testid='options-list-clear-button']",
};

describe("AdditionalServices", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(AdditionalServices, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.button).exists()).toBe(true);
    expect(wrapper.find(selectors.title).exists()).toBe(true);
    expect(wrapper.find(selectors.description).exists()).toBe(false);
    expect(wrapper.find(selectors.list).exists()).toBe(false);
  });

  test("clicking the button should emit an event", async () => {
    const wrapper = mount(AdditionalServices, { props });

    await wrapper.find(selectors.button).trigger("click");

    const events = wrapper.emitted<Event[]>()["toggle:open"];
    expect(events).toBeTruthy();
    expect(events[0]).toStrictEqual([]);
  });
});
describe("when the props open is true", () => {
  test("it should render the list of option", () => {
    const wrapper = mount(AdditionalServices, {
      props: { ...props, open: true },
    });

    expect(wrapper.find(selectors.description).exists()).toBe(true);
    expect(wrapper.find(selectors.list).exists()).toBe(true);
    expect(wrapper.findAll(selectors.listItem).length).toBe(props.additionalServices.length);
  });
});

describe("when a value is passed as selected prop", () => {
  test("the corresponding service should be selected", () => {
    const wrapper = mount(AdditionalServices, {
      props: {
        ...props,
        modelValue: [props.additionalServices[0].code],
        open: true,
      },
    });

    expect(wrapper.findAll(selectors.listItem)[0].attributes("selected")).toBe("true");
  });
  test("Next the title should appear the label common.filled", () => {
    const wrapper = mount(AdditionalServices, {
      props: { ...props, modelValue: [props.additionalServices[0].code] },
    });
    expect(wrapper.find(selectors.title).text()).toBe("additional.services.test-id.title common.filled");
  });
});

describe("when loading is set to true it should display the skeleton", () => {
  test("if is closed", () => {
    const wrapper = mount(AdditionalServices, {
      props: { ...props, loading: true },
    });

    expect(wrapper.find(selectors.skeleton).exists()).toBe(true);
    expect(wrapper.find(selectors.skeleton).isVisible()).toBe(true);
  });

  test("if is opened", () => {
    const wrapper = mount(AdditionalServices, {
      props: { ...props, loading: true, open: true },
    });

    expect(wrapper.find(selectors.skeleton).exists()).toBe(true);
    expect(wrapper.find(selectors.skeleton).isVisible()).toBe(true);
  });
});

describe("when the user selects a service", () => {
  test("it should emit an event", async () => {
    const wrapper = mount(AdditionalServices, {
      props: { ...props, open: true },
    });

    await wrapper.findAll(selectors.listItem)[1].trigger("click");

    const events = wrapper.emitted<Event[]>()["update:modelValue"];
    expect(events).toBeTruthy();
    expect(events[0][0]).toStrictEqual([props.additionalServices[1].code]);
  });
});

describe("when the user click on Clear All", () => {
  test("it should emit an event", async () => {
    const wrapper = mount(AdditionalServices, {
      props: {
        ...props,
        modelValue: [props.additionalServices[1].code],
        open: true,
      },
    });

    expect(wrapper.findAll(selectors.listItem)[1].attributes("selected")).toBe("true");
    await wrapper.find(selectors.clearBtn).trigger("click");

    const events = wrapper.emitted<Event[]>()["update:modelValue"];
    expect(events).toBeTruthy();
    expect(events[0][0]).toStrictEqual([]);
  });
});

describe("when is disabled", () => {
  test("it shouldn't emit any event on click", async () => {
    const wrapper = mount(AdditionalServices, {
      props: {
        ...props,
        modelValue: [props.additionalServices[1].code],
        disabled: true,
        open: true,
      },
    });

    await wrapper.findAll(selectors.listItem)[0].trigger("click");
    await wrapper.find(selectors.clearBtn).trigger("click");

    const events = wrapper.emitted<Event[]>()["update:modelValue"];
    expect(events).toBeFalsy();
  });

  describe("if the readonly prop is true", () => {
    test("if an option is selected the option list should be readonly", async () => {
      const wrapper = shallowMount(AdditionalServices, {
        props: { ...props, readonly: true, open: true, modelValue: [props.additionalServices[1].code] },
      });

      expect(wrapper.findComponent({ name: "NovaOptionsList" }).attributes("readonly")).toBe("");
    });

    test("if no options are selected it should show the no content util component", async () => {
      const wrapper = shallowMount(AdditionalServices, {
        props: { ...props, readonly: true, open: true },
      });

      expect(wrapper.findComponent({ name: "NoContentUtil" }).isVisible()).toBeTruthy();
    });
  });
});
