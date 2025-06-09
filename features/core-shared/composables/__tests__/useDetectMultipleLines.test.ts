import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { useDetectMultiLine } from "../useDetectMultipleLines";
import { ref } from "vue";

const useResizeObserverMock = vi.hoisted(() => vi.fn());

vi.mock("@vueuse/core", () => ({
  useResizeObserver: useResizeObserverMock,
}));

vi.mock("lodash", () => ({
  debounce: vi.fn((fn) => fn),
}));

describe("useDetectMultiLine", () => {
  beforeAll(() => {
    useResizeObserverMock.mockReset();
  });

  window.getComputedStyle = vi.fn().mockImplementation(() => ({
    getPropertyValue: (prop: string) => {
      if (prop === "line-height") {
        return "20px";
      }
      return "";
    },
  }));

  it("should detect when the offsetHight is higher then the line-height", async () => {
    useResizeObserverMock.mockImplementation((_, callback) => {
      const mockElement = { offsetHeight: 100 };
      callback([{ target: mockElement }]);
    });

    const element = ref(document.createElement("div"));
    const { isMultiLine } = useDetectMultiLine(element);

    expect(isMultiLine.value).toBe(true);
  });

  it("should detect when the offsetHight is lower the line-height", async () => {
    useResizeObserverMock.mockImplementation((_, callback) => {
      const mockElement = { offsetHeight: "12" };
      callback([{ target: mockElement }]);
    });

    const element = ref(document.createElement("div"));
    const { isMultiLine } = useDetectMultiLine(element);

    expect(isMultiLine.value).toBe(false);
  });

  it("should detect when the scrollHeight is higher the line-height", async () => {
    useResizeObserverMock.mockImplementation((_, callback) => {
      const mockElement = { scrollHeight: 100 };
      callback([{ target: mockElement }]);
    });

    const element = ref(document.createElement("div"));
    const { isMultiLine } = useDetectMultiLine(element);

    expect(isMultiLine.value).toBe(true);
  });

  it("should detect when the scrollHeight is lower the line-height", async () => {
    useResizeObserverMock.mockImplementation((_, callback) => {
      const mockElement = { scrollHeight: 12 };
      callback([{ target: mockElement }]);
    });

    const element = ref(document.createElement("div"));
    const { isMultiLine } = useDetectMultiLine(element);

    expect(isMultiLine.value).toBe(false);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
