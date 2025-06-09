import { RouterLinkStub, config, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import GroupedPremadeCollapsable from "../GroupedPremadeCollapsable.vue";

const props = {
  name: "name-mock",
  options: [
    {
      id: "item-id-1",
      code: "item-code-1",
      name: "item-name-1",
      language_code: "en",
      hierarchical_group_code: "hierarchical_group_code-1",
    },
    {
      id: "item-id-2",
      code: "item-code-2",
      name: "item-name-2",
      language_code: "en",
      hierarchical_group_code: "hierarchical_group_code-1",
    },
  ],
  to: "to-example",
  open: false,
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

config.global.mocks = {
  $route: { path: "random-path", params: { endpoint: "highlights" } },
  $t: (s: string) => s,
};
const mockRoute = { params: {}, query: {}, path: {} };
vi.stubGlobal("useRoute", () => mockRoute);
vi.mock("@vueuse/router", () => ({
  useRouteQuery: () => false,
}));

describe("GroupedPremadeItems", () => {
  test("it should render correctly", () => {
    const wrapper = mount(GroupedPremadeCollapsable, { props });

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.html().includes(props.name)).toBeTruthy();
    expect(wrapper.findAll("li").length).toBe(2);
    expect(wrapper.html().includes("2 common.items")).toBeTruthy();
  });

  describe("if the category is selected", () => {
    test("it should show the selected status", () => {
      config.global.mocks.$route.path = props.to;

      const wrapper = mount(GroupedPremadeCollapsable, { props });
      expect(wrapper.find(".NovaCollapse--active").exists()).toBeTruthy();
    });
  });

  describe("if an item is selected", () => {
    mockRoute.path = "to-example/item-code-1";
    test("it should have the blue border class", () => {
      const wrapper = mount(GroupedPremadeCollapsable, { props });
      expect(wrapper.find(".border-blue").exists()).toBeTruthy();
    });
  });
});
