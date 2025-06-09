import { mount, config, RouterLinkStub } from "@vue/test-utils";
import { expect, describe, test, vi } from "vitest";
import AppHeader from "../AppHeader.vue";
import { testId } from "@/utils/test.utils";

const mockRouter = {
  push: vi.fn(),
};

const mockRoute = {
  path: "/",
};

config.global.mocks = {
  $t: (s: string) => s,
  $router: mockRouter,
  $route: {
    path: "/",
  },
};

const mock = {};

vi.mock("@/features/experience-dashboard/lib/get-dashboard-url");

vi.mock("@/features/auth/useAuthStore", () => ({
  useAuthStore: vi.fn(() => mock),
}));

vi.stubGlobal("useRoute", () => mockRoute);

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

describe("AppHeader", () => {
  test("by clicking on a tab you should be redirected", async () => {
    const wrapper = mount(AppHeader);

    expect(wrapper).toBeTruthy();

    await wrapper.findAll(testId("nova-tabs-item"))[0].trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith("/masterdata-management");

    await wrapper.findAll(testId("nova-tabs-item"))[1].trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});
