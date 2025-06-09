import { RouterLinkStub, config, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import { testId } from "@/utils/test.utils";

const mockRouter = {
  push: vi.fn(),
  resolve: () => {
    return { href: "/" };
  },
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

config.global.mocks = {
  $t: (text: string) => text,
  $route: {
    path: "",
    name: "experience-id-raw",
  },
};
vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

vi.stubGlobal("useRouter", () => mockRouter);

const mockRoute = {
  path: "/test-url/premade_included",
  fullPath: "/test-url/premade_included",
  name: "experience-id-raw",
};

vi.stubGlobal("useRoute", () => mockRoute);

describe("ProductsSidebar", () => {
  test("it should mount correctly", () => {
    const wrapper = mount(ProductsSidebar);

    expect(wrapper.findAll(".AppSidebar__li").length).toBe(2);
    expect(wrapper.findAll(testId("app-sidebar-button-icon")).length).toBe(2);
  });

  test("it should collapse correctly", async () => {
    const wrapper = mount(ProductsSidebar);

    await wrapper.find(testId("app-sidebar-collapse-icon-closed")).trigger("click");

    expect(wrapper.find("[open='true']").exists()).toBeTruthy();
  });
});
