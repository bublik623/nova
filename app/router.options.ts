import type { RouterConfig } from "@nuxt/schema";

// https://router.vuejs.org/api/#routeroptions
export default {
  scrollBehavior: function (to, from) {
    if (to.hash) {
      return { el: decodeURIComponent(to.hash), top: 100, behavior: "smooth" };
    }
    if (to.path === from.path) {
      return {};
    }
    return { top: 0 };
  },
} as RouterConfig;
