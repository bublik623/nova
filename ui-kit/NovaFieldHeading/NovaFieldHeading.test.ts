import { config, mount, VueWrapper } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaFieldHeading from "./NovaFieldHeading.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

let wrapper: VueWrapper<InstanceType<typeof NovaFieldHeading>>;
const render = () => {
  wrapper = mount(NovaFieldHeading, {
    props: {
      title: "Pricing",
      description: "Pricing Description",
    },
  });
};

describe("NovaFieldHeading", () => {
  test("it should mount and render correctly", () => {
    render();

    expect(wrapper.html()).toContain("Pricing");
    expect(wrapper.html()).toContain("Pricing Description");
    expect(wrapper.html()).not.toContain("common.required");
  });

  test("toggle the visibility of the required badge", async () => {
    render();

    await wrapper.setProps({ required: true });

    expect(wrapper.html()).toContain("Pricing");
    expect(wrapper.html()).toContain("Pricing Description");
  });

  test("toggle the visibility of the description text", async () => {
    render();

    await wrapper.setProps({ description: undefined });

    expect(wrapper.html()).toContain("Pricing");
    expect(wrapper.html()).not.toContain("Pricing Description");
  });
});
