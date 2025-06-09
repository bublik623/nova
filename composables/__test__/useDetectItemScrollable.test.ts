import { Mock, afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { useDetectItemScrollable } from "../useDetectItemScrollable";
import { ref } from "vue";
import * as VueUse from "@vueuse/core";

vi.mock("@vueuse/core", () => ({
  useResizeObserver: vi.fn(),
}));

vi.mock("lodash", () => ({
  debounce: vi.fn((fn) => fn),
}));

describe("useDetectItemScrollable", () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  it("should detect when an element is horizontally and vertically scrollable", async () => {
    (VueUse.useResizeObserver as Mock).mockImplementation((_, callback) => {
      const mockElement = { scrollWidth: 1000, clientWidth: 500, scrollHeight: 1000, clientHeight: 500 };
      callback([{ target: mockElement }]);
    });

    const element = ref(document.createElement("div"));
    const { isHorizontallyScrollable, isVerticallyScrollable } = useDetectItemScrollable(element);

    expect(isHorizontallyScrollable.value).toBe(true);
    expect(isVerticallyScrollable.value).toBe(true);
  });

  it("should detect when an element is not scrollable", async () => {
    (VueUse.useResizeObserver as Mock).mockImplementation((_, callback) => {
      const mockElement = { scrollWidth: 500, clientWidth: 500, scrollHeight: 500, clientHeight: 500 };
      callback([{ target: mockElement }]);
    });

    const element = ref(document.createElement("div"));
    const { isHorizontallyScrollable, isVerticallyScrollable } = useDetectItemScrollable(element);

    expect(isHorizontallyScrollable.value).toBe(false);
    expect(isVerticallyScrollable.value).toBe(false);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
