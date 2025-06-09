import { mount, config, RouterLinkStub } from "@vue/test-utils";
import { expect, describe, it } from "vitest";
import AppSidebar, { NavElement } from "../AppSidebar.vue";

config.global.mocks = {
  $t: (text: string) => text,
  $route: {
    fullPath: "/test-route",
  },
};
const mockNavigation: NavElement[] = [
  {
    icon: "ticket",
    title: "Experiences",
    path: "#experience",
  },
  {
    icon: "ticket",
    title: "Multydays tours",
    path: "#tours",
  },
  {
    icon: "calendar",
    title: "multyday",
    path: "#",
  },
];
const selectors = {
  container: "[data-testid='app-sidebar-container']",
  buttonIcon: "[data-testid='app-sidebar-button-icon']",
  text: "[data-testid='app-sidebar-text']",
  iconClosed: "[data-testid='app-sidebar-collapse-icon-closed']",
  iconOpened: "[data-testid='app-sidebar-collapse-icon-opened']",
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

describe("when the props show is false", () => {
  it("it should mount and render correctly and don't display the text", () => {
    const wrapper = mount(AppSidebar, {
      props: {
        navElements: mockNavigation,
        show: false,
      },
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.container).exists()).toBe(true);
    expect(wrapper.find(selectors.buttonIcon).exists()).toBe(true);
    expect(wrapper.find(selectors.text).attributes().style).toContain("display: none");
  });

  describe("when the props show is true", () => {
    it("it should display the text", () => {
      const wrapper = mount(AppSidebar, {
        props: {
          navElements: mockNavigation,
          show: true,
        },
      });

      expect(wrapper).toBeTruthy();

      expect(wrapper.find(selectors.text).attributes().style).toBeFalsy();
      expect(wrapper.find(selectors.text).text()).toBe("Experiences");
    });
  });

  describe("If click on the expand img", () => {
    it("it should emit an event", async () => {
      const wrapper = mount(AppSidebar, {
        props: {
          navElements: mockNavigation,
          show: false,
        },
      });

      await wrapper.find(selectors.iconClosed).trigger("click");
      const events = wrapper.emitted<Event[]>()["click:collapsing"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });
  });

  describe("If click on the collapse img", () => {
    it("it should emit an event", async () => {
      const wrapper = mount(AppSidebar, {
        props: {
          navElements: mockNavigation,
          show: true,
        },
      });

      await wrapper.find(selectors.iconOpened).trigger("click");
      const events = wrapper.emitted<Event[]>()["click:collapsing"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });
  });
});
