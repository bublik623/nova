import { describe, it, expect } from "vitest";
import { getNextAvailableSection } from "../get-next-available-section";

describe("getNextAvailableSection", () => {
  it("should return the next available section URL", () => {
    const sidebarCategories = {
      category1: { url: "/section1" },
      category2: { url: "/section2" },
      category3: { url: "/section3" },
    };
    const routePath = "/section1";

    // @ts-expect-error .
    const result = getNextAvailableSection(sidebarCategories, routePath);

    expect(result).toBe("/section2");
  });

  it("should return undefined if there is no next available section", () => {
    const sidebarCategories = {
      category1: { url: "/section1" },
      category2: { url: "/section2" },
      category3: { url: "/section3" },
    };
    const routePath = "/section3";

    // @ts-expect-error .
    const result = getNextAvailableSection(sidebarCategories, routePath);

    expect(result).toBeUndefined();
  });
});
