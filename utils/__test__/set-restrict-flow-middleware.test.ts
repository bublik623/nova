// tests/middleware-setup.spec.ts
import { describe, it, expect } from "vitest";
import { NuxtPage } from "nuxt/schema";
import { setRestrictFlowMiddleware } from "../set-restrict-flow-middleware";

describe("setMiddleware", () => {
  it("should set the 'restrict-flow' middleware for pages with '/experience/' in the path", () => {
    const pages: NuxtPage[] = [
      { path: "/home" },
      { path: "/experience/page1", meta: { someMeta: true } },
      { path: "/about" },
      {
        path: "/experience/sub",
        children: [
          { path: "/experience/sub/page", meta: {} },
          { path: "/experience/sub-2/page", meta: {} },
        ],
      },
      { path: "/contact" },
    ];

    setRestrictFlowMiddleware(pages);

    expect(pages[0].meta).toBeUndefined();
    expect(pages[2].meta).toBeUndefined();
    expect(pages[4].meta).toBeUndefined();
    expect(pages[1].meta!.middleware).toEqual(["restrict-flow"]);

    const childPages = pages[3].children!;
    expect(childPages[0].meta!.middleware).toEqual(["restrict-flow"]);
    expect(childPages[1].meta!.middleware).toEqual(["restrict-flow"]);
  });

  it("should set the 'restrict-flow' middleware for deeply nested pages", () => {
    const pages: NuxtPage[] = [
      {
        path: "/experience/level1",
        children: [
          {
            path: "/experience/level1/level2",
            children: [
              { path: "/experience/level1/level2/level3", meta: {} },
              { path: "/experience/level1/level2/other", meta: {} },
            ],
          },
          {
            path: "/non-experience/level1",
            children: [{ path: "/non-experience/level1/level2", meta: {} }],
          },
        ],
      },
    ];

    setRestrictFlowMiddleware(pages);

    expect(pages[0].meta!.middleware).toEqual(["restrict-flow"]);
    const level2 = pages[0].children![0];
    expect(level2.meta!.middleware).toEqual(["restrict-flow"]);
    const level3 = level2.children![0];
    expect(level3.meta!.middleware).toEqual(["restrict-flow"]);
    const level3Other = level2.children![1];
    expect(level3Other.meta!.middleware).toEqual(["restrict-flow"]);

    const nonExperienceBranch = pages[0].children![1];
    expect(nonExperienceBranch.meta).toBeUndefined();
    expect(nonExperienceBranch.children![0].meta).toEqual({});
  });
});
