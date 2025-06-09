import { NuxtPage } from "nuxt/schema";

export function setRestrictFlowMiddleware(pages: NuxtPage[]) {
  for (const page of pages) {
    if (page.path.includes("/experience/")) {
      page.meta ||= {};
      // Note that this will override any middleware set in `definePageMeta` in the page
      page.meta.middleware = ["restrict-flow"];
    }
    if (page.children) {
      setRestrictFlowMiddleware(page.children);
    }
  }
}
