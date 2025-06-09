import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaLabel from "./NovaLabel.vue";

const label = `span[data-testid="nova-label"]`;

describe("NovaLabel", () => {
  test("it should mount and render correctly", () => {
    expect(NovaLabel).toBeTruthy();

    const wrapper = mount(NovaLabel, {
      slots: {
        default: "Hello World",
      },
      props: {
        theme: "primary",
      },
    });

    expect(wrapper.find(label).text()).toBe("Hello World");
    expect(wrapper.find(label).classes()).toStrictEqual(["label", "bg-primary-10", "text-primary-110"]);
    expect(wrapper.find(label).attributes().size).toContain("md");

    describe("if the props are sm and secondary", () => {
      test("it should have the sm and secondary classes", () => {
        expect(NovaLabel).toBeTruthy();

        const wrapper = mount(NovaLabel, {
          slots: {
            default: "Hello World",
          },
          props: {
            theme: "secondary",
            size: "sm",
          },
        });

        expect(wrapper.find(".label").text()).toBe("Hello World");
        expect(wrapper.find(label).classes()).toStrictEqual("label bg-secondary-10 text-secondary-110");
        expect(wrapper.find(label).attributes().size).toContain("sm");
      });
    });
  });
});
