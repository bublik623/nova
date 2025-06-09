import { mount, config } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import ActionBarCta, { Props } from "../ActionBarCta.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  id: "test",
  title: "test title",
  description: "test description",
  ctaText: "test cta",
};

const slots = {
  ctaText: "slot cta-text",
  "additional-info": "additional-info",
};

const selectors = {
  cta: "button[data-testid='document-action-bar-test']",
};

describe("DocumentActionBarCta", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(ActionBarCta, { props, slots: {} });

    expect(wrapper).toBeTruthy();
    expect(wrapper.html()).toContain(props.title);
    expect(wrapper.html()).toContain(props.ctaText);
    expect(wrapper.find(selectors.cta).attributes().disabled).toBe("");
    expect(wrapper.find(selectors.cta).attributes().variant).toBe("contained");
  });

  describe("when the cta type is passed as prop", () => {
    test("it should render the correct button variant", () => {
      const wrapper = mount(ActionBarCta, {
        props: { ...props, ctaType: "outline" },
        slots,
      });

      expect(wrapper.find(selectors.cta).attributes().variant).toBe("outline");
    });
  });

  describe("when the cta is enabled via prop", () => {
    test("it should enable the button", () => {
      const wrapper = mount(ActionBarCta, {
        props: { ...props, ctaEnabled: true },
        slots,
      });

      expect(wrapper.find(selectors.cta).attributes().disabled).toBe(undefined);
    });
  });

  describe("when the cta is clicked", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(ActionBarCta, {
        props: { ...props, ctaEnabled: true },
        slots,
      });

      await wrapper.find(selectors.cta).trigger("click");

      const events = wrapper.emitted<Event[]>()["click:action"];
      expect(events).toBeTruthy();
    });
  });

  describe("when the slot 'cta-text' is passed", () => {
    test("it should display it as button text", () => {
      const wrapper = mount(ActionBarCta, {
        props,
        slots: { ctaText: "slot cta-text" },
      });

      expect(wrapper.find(selectors.cta).text()).toBe("slot cta-text");
    });
  });

  describe("when the slot 'cta-text' is not passed", () => {
    test(" it should display the props 'ctaText' as fallback", () => {
      const wrapper = mount(ActionBarCta, {
        props,
        slots: {},
      });
      expect(wrapper.find(selectors.cta).text()).toBe("test cta");
    });
  });
});
