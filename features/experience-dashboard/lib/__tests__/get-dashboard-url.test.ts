import { mount, config } from "@vue/test-utils";
import { createRouter, createWebHistory, Router } from "vue-router";

import { describe, test, expect, beforeEach, vi } from "vitest";
import { getDashboardUrl } from "../get-dashboard-url";

config.global.mocks = {
  $t: (text: string) => text,
  $route: {
    path: "test-id",
  },
};

const routes = [
  {
    path: "/",
    name: "index",
    component: {
      template: "index page",
    },
  },
  {
    path: "/random-page",
    component: {
      template: "random page",
    },
  },
];

const mockRoute = ref({
  path: "/random-page",
  name: "experience-id-raw-settings",
});

vi.stubGlobal("useRoute", () => mockRoute.value);
vi.stubGlobal("useRouter", () => router);
let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.push("/random-page");
  await router.isReady();
});

const Component = {
  template: `
    <div>
    </div>
  `,
};

describe("getDashboardUrl", () => {
  describe("if the user is in a raw page", () => {
    test("it should return the raw url", async () => {
      mount(Component, {
        global: {
          plugins: [router],
        },
      });
      expect(getDashboardUrl().href).toBe("/?content=raw");
    });
  });
  describe("if the user is in a curation page", () => {
    test("it should return the curation url", () => {
      mockRoute.value = {
        path: "/random-page",
        name: "experience-id-curation-settings",
      };
      mount(Component, {
        global: {
          plugins: [router],
        },
      });
      expect(getDashboardUrl().href).toBe("/?content=editorial");
    });
  });
  describe("if the user is in a translation page", () => {
    test("it should return the translation url as editorial", () => {
      mockRoute.value = {
        path: "/random-page",
        name: "experience-id-translation-settings",
      };
      mount(Component, {
        global: {
          plugins: [router],
        },
      });
      expect(getDashboardUrl().href).toBe("/?content=editorial");
    });
  });

  describe("if the route name is falsy", () => {
    test("it should return the root url", () => {
      mockRoute.value = {
        path: "/random-page",
        name: "",
      };
      mount(Component, {
        global: {
          plugins: [router],
        },
      });
      expect(getDashboardUrl().href).toBe(router.resolve("/").href);
    });
  });

  describe("if the route name contains both raw and curation", () => {
    test("it should prioritize editorial over raw", () => {
      mockRoute.value = {
        path: "/random-page",
        name: "experience-id-raw-curation-settings",
      };
      mount(Component, {
        global: {
          plugins: [router],
        },
      });
      expect(getDashboardUrl().href).toBe("/?content=editorial");
    });
  });

  describe("if the route name does not match any known flow", () => {
    test("it should return the url with query content undefined", () => {
      mockRoute.value = {
        path: "/random-page",
        name: "unknown-page",
      };
      mount(Component, {
        global: {
          plugins: [router],
        },
      });
      expect(getDashboardUrl().href).toBe("/");
    });
  });
});
