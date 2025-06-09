import { describe, test, expect } from "vitest";
import { getIdFromLocation, getFileNameFromContentDisposition } from "../http-utils";

describe("http-utils", () => {
  describe("getIdFromLocation", () => {
    test("it should return the last segment of the location URL", () => {
      const location = "location/123-id";
      const id = getIdFromLocation(location);

      expect(id).toBe("123-id");
    });
  });

  describe("getFileNameFromContentDisposition", () => {
    test("it should return the fileName from the content disposition header when it exists", () => {
      const fileName = "a file name.xlsx";
      const headers: Record<string, string> = {
        "content-disposition": `form-data; name="attachment"; filename="${fileName}"`,
      };

      const result = getFileNameFromContentDisposition(headers);

      expect(result).toBe(fileName);
    });

    test("it should return undefined when content disposition header does not include the file name", () => {
      const headers: Record<string, string> = {
        "content-disposition": `inline`,
      };

      const result = getFileNameFromContentDisposition(headers);

      expect(result).toBeUndefined();
    });

    test("it should return undefined when content disposition header does not exist", () => {
      const headers: Record<string, string> = {};

      const result = getFileNameFromContentDisposition(headers);

      expect(result).toBeUndefined();
    });
  });
});
