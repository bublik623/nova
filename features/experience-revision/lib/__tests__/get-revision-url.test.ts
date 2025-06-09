import { describe, expect, test } from "vitest";
import { getRevisionUrl } from "../get-revision-url";

describe("getRevisionUrl", () => {
  test("should return the correct URL", () => {
    const experienceId = "123";
    const revisionId = "456";
    const flow = "edit";

    const expectedUrl = "/experience/123/revision/456/edit/settings";
    const actualUrl = getRevisionUrl(experienceId, revisionId, flow);

    expect(actualUrl).toBe(expectedUrl);
  });

  test("should return the correct URL with language", () => {
    const experienceId = "123";
    const revisionId = "456";
    const flow = "edit";
    const language = "en";

    const expectedUrl = "/experience/123/revision/456/edit/en/settings";
    const actualUrl = getRevisionUrl(experienceId, revisionId, flow, language);

    expect(actualUrl).toBe(expectedUrl);
  });

  test("should return the correct media url", () => {
    const experienceId = "123";
    const revisionId = "456";
    const flow = "media";

    const expectedUrl = "/experience/123/revision/456/media/visuals";
    const actualUrl = getRevisionUrl(experienceId, revisionId, flow);

    expect(actualUrl).toBe(expectedUrl);
  });
});
