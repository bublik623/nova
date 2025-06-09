import { beforeEach, describe, expect, test, vi } from "vitest";
import { useQueryParamBridge } from "../useQueryParamBridge";
import { flushPromises } from "@vue/test-utils";

const queryParamRef = ref();
vi.mock("@vueuse/router", () => {
  return {
    useRouteQuery: () => queryParamRef,
  };
});

describe("useQueryParamBridge", () => {
  beforeEach(() => {
    queryParamRef.value = undefined;
  });

  describe("when the given query param already exists", () => {
    describe("when the query param value is valid", () => {
      test("it should initialize the given ref value with the query param value when the query value is valid", () => {
        const valueRef = ref("a value");
        queryParamRef.value = "value from query param";

        useQueryParamBridge(
          valueRef,
          "a-query-param-name",
          (val) => val,
          (_) => true // always valid query param value
        );

        expect(valueRef.value).toBe("value from query param");
      });
    });

    describe("when the query param value is invalid", () => {
      test("it should initialize the query param with the given ref value", () => {
        const valueRef = ref("a value");
        queryParamRef.value = "value from query param";

        useQueryParamBridge(
          valueRef,
          "a-query-param-name",
          (val) => val,
          (_) => false // always invalid query param value
        );

        expect(queryParamRef.value).toBe("a value");
      });
    });
  });

  describe("when the given query param does not exists or does not have a value", () => {
    test("it should initialize the query param with the given ref value", () => {
      const valueRef = ref("a value");
      queryParamRef.value = undefined;

      useQueryParamBridge(valueRef, "a-query-param-name");

      expect(queryParamRef.value).toBe("a value");
    });
  });

  test("it should update the query param when the given ref value change", async () => {
    const valueRef = ref();

    useQueryParamBridge(valueRef, "a-query-param-name");

    valueRef.value = "a new value";
    await flushPromises();

    expect(queryParamRef.value).toBe("a new value");
  });
});
