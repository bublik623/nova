import { test, expect, describe } from "vitest";
import { serializeToRsql } from "../serialize-to-rsql";
import { AdvancedFilterDateRangeValue, AdvancedFilterMultiselectValue } from "../../types/filters";

const fromDate = new Date(2024, 1, 7, 9, 4, 2, 8);
const fromDateAsRSQLFilterValue = "2024-02-07T09:04:02.008Z";
const toDate = new Date(2024, 1, 9, 9, 4, 2, 8);
const toDateAsRSQLFilterValue = "2024-02-09T09:04:02.008Z";

describe("useRsqlSerializer", () => {
  test("it should return an empty string, when given filter object does have no keys", () => {
    const result = serializeToRsql({}, { frontendFilterKey: "backendPropertyKey" });

    expect(result).toBe("");
  });

  test.each([
    [
      "with lower and upper bounds",
      { type: "date-range", value: { from: fromDate, to: toDate } } as AdvancedFilterDateRangeValue,
      `backendPropertyKey>=${fromDateAsRSQLFilterValue};backendPropertyKey<=${toDateAsRSQLFilterValue}`,
    ],
    [
      "with lower bound",
      { type: "date-range", value: { from: fromDate } } as AdvancedFilterDateRangeValue,
      `backendPropertyKey>=${fromDateAsRSQLFilterValue}`,
    ],
    [
      "with upper bound",
      { type: "date-range", value: { to: toDate } } as AdvancedFilterDateRangeValue,
      `backendPropertyKey<=${toDateAsRSQLFilterValue}`,
    ],
    ["with no bounds", { type: "date-range", value: {} } as AdvancedFilterDateRangeValue, ""],
  ])(
    "it should return the RSQL representation of date-range filter %s",
    (_testCaseName, dateRangeFilter, expectedResult) => {
      const result = serializeToRsql(
        { frontendFilterKey: dateRangeFilter },
        { frontendFilterKey: "backendPropertyKey" }
      );

      expect(result).toBe(expectedResult);
    }
  );

  test.each([
    [
      {
        type: "multiselect",
        value: [
          { value: "CODE1", label: "CODE1-LABEL" },
          { value: "CODE2", label: "CODE2-LABEL" },
          { value: "CODE3", label: "CODE3-LABEL" },
        ],
      } as AdvancedFilterMultiselectValue,
      "backendPropertyKey=in=(CODE1,CODE2,CODE3)",
    ],
    [{ type: "multiselect", value: [] } as AdvancedFilterMultiselectValue, ""],
  ])("it should return the RSQL representation of multiselect filter", (multiselectFilter, expectedResult) => {
    const result = serializeToRsql(
      { frontendFilterKey: multiselectFilter },
      { frontendFilterKey: "backendPropertyKey" }
    );

    expect(result).toBe(expectedResult);
  });

  test("it should return RSQL representation of multiple filters chained with AND operators", () => {
    const expectedDateRangeFilterRsql = `backendPropertyKeyA>=${fromDateAsRSQLFilterValue}`;
    const andOperator = ";";
    const expectedMultiSelectFilterRsql = "backendPropertyKeyB=in=(A,B)";
    const expectedResult = `${expectedDateRangeFilterRsql}${andOperator}${expectedMultiSelectFilterRsql}`;

    const result = serializeToRsql(
      {
        frontendFilterKeyA: { type: "date-range", value: { from: fromDate } },
        frontendFilterKeyB: {
          type: "multiselect",
          value: [
            { value: "A", label: "A-LABEL" },
            { value: "B", label: "B-LABEL" },
          ],
        },
      },
      {
        frontendFilterKeyA: "backendPropertyKeyA",
        frontendFilterKeyB: "backendPropertyKeyB",
      }
    );

    expect(result).toBe(expectedResult);
  });

  test("it should throw an Error when it can't map the filter key to an attribute key", () => {
    expect(() =>
      serializeToRsql(
        {
          frontendFilterKey: { type: "date-range", value: { from: fromDate } },
        },
        {
          aDifferentFrontendFilterKey: "backendPropertyKey",
        }
      )
    ).toThrowError(new Error("filtering not supported on 'frontendFilterKey'"));
  });
});
