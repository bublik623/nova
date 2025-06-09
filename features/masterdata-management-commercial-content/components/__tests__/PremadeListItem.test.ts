import { RouterLinkStub, config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import PremadeListItem, { Props } from "../PremadeListItem.vue";

const props: Props = {
  to: "expected-link",
  selected: false,
  item: {
    id: "item-id",
    code: "item-code",
    name: "item-name",
    language_code: "en",
  },
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

config.global.mocks = {
  $route: { path: "random-path" },
};

describe("PremadeListItem", () => {
  test("it should mount correctly", () => {
    const wrapper = mount(PremadeListItem, { props });
    expect(wrapper.find(".PremadeListItem").attributes("selected")).toBe(undefined);
    expect(wrapper.text()).include(props.item.name);
  });

  describe("if the item is selected", () => {
    test("it should show the selected status", () => {
      const wrapper = mount(PremadeListItem, { props: { ...props, selected: true } });
      expect(wrapper.find(".PremadeListItem").attributes("selected")).toBe("true");
    });
  });
});
