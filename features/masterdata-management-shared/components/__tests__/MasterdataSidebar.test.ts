import { RouterLinkStub, config, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import MasterdataSidebar, { Props } from "@/features/masterdata-management-shared/components/MasterdataSidebar.vue";

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

const mockRoute = {
  path: "/test-url/premade_included",
  fullPath: "/test-url/premade_included",
};

vi.stubGlobal("useRoute", () => mockRoute);

const props: Props = {
  categories: {
    functional_content: [
      { id: "experience_category", url: "/test-url/experience_category" },
      { id: "promotional_options", url: "/test-url/promotional_options" },
      { id: "product_brand", url: "/test-url/product_brand" },
      { id: "features", url: "/test-url/features" },
    ],
    commercial_content: [
      { id: "premade_highlights", url: "/test-url/premade_highlights" },
      { id: "premade_included", url: "/test-url/premade_included" },
      { id: "premade_excluded", url: "/test-url/premade_excluded" },
      { id: "premade_important", url: "/test-url/premade_important" },
    ],
    operational_content: [
      { id: "currency", url: "/test-url/currency" },
      { id: "holder_type", url: "/test-url/holder_type" },
      { id: "languages", url: "/test-url/languages" },
    ],
  },
};

const listItem = ".MasterDataSidebar__list-item";

describe("MasterdataSidebar", () => {
  test("it should render correctly", () => {
    const wrapper = mount(MasterdataSidebar, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.findAll(listItem).length).toBe(11);
  });

  describe("if the route match the url", () => {
    test("the item should be selected", async () => {
      const wrapper = mount(MasterdataSidebar, { props });
      const selectedItem = wrapper.find(`[selected="true"]`);

      expect(selectedItem.text()).include("masterdata-management.sidebar-title.premade_included");

      // check if the link has the right url
      expect(selectedItem.findComponent(RouterLinkStub).props().to).toContain("/test-url/premade_included");
    });
  });
});
