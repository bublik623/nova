import { describe, expect, test } from "vitest";
import { getNextRawStatusCode } from "../get-next-raw-status-code";

describe("getNextRawStatusCode", () => {
  test("should return SENT_TO_REVIEW when publish is true", () => {
    const currentStatusCode = "UP_TO_DATE";
    const publish = true;

    const result = getNextRawStatusCode(currentStatusCode, publish);

    expect(result).toBe("SENT_TO_REVIEW");
  });

  test("should return IN_REVIEW when publish is false and current status code is UP_TO_DATE", () => {
    const currentStatusCode = "UP_TO_DATE";
    const publish = false;

    const result = getNextRawStatusCode(currentStatusCode, publish);

    expect(result).toBe("IN_REVIEW");
  });

  test("should return IN_REVIEW when publish is false and current status code is SENT_TO_REVIEW", () => {
    const currentStatusCode = "SENT_TO_REVIEW";
    const publish = false;

    const result = getNextRawStatusCode(currentStatusCode, publish);

    expect(result).toBe("IN_REVIEW");
  });

  test("should return null when publish is false and current status code is IN_REVIEW", () => {
    const currentStatusCode = "IN_REVIEW";
    const publish = false;

    const result = getNextRawStatusCode(currentStatusCode, publish);

    expect(result).toBe(null);
  });
});
