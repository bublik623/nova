import { describe, expect, test } from "vitest";
import { AxiosResponse } from "axios";
import { ndjsonInterceptor } from "../ndjson-interceptor";

describe("ndjsonInterceptor", () => {
  test("it should parse the response data", () => {
    const responseMock = {
      status: 200,
      data: `{ "parsed": true }`,
      headers: {
        "content-type": "application/x-ndjson",
      },
    } as unknown as AxiosResponse;

    const result = ndjsonInterceptor(responseMock);

    expect(result.data).toEqual([{ parsed: true }]);
  });
});
