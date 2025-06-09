import { describe, test, expect, vi } from "vitest";
import { getSidebarConfig } from "../get-sidebar-config";
import { AllowedRevisionFlow } from "../../schema";
import * as getRawSectionsMocks from "../../config/raw.config";
import * as getCurationSectionsMocks from "../../config/curation.config";
import * as getTranslationSectionsMocks from "../../config/translation.config";
import * as getMediaSectionsMocks from "../../config/media.config";

const rawSection = vi.spyOn(getRawSectionsMocks, "getRawSections");
rawSection.mockImplementation(() => ({
  // @ts-expect-error ...
  settings: {
    id: "settings",
    fields: [
      {
        id: "title",
        required: true,
      },

      {
        id: "description",
        required: false,
      },
    ],
  },
}));

const curationSection = vi.spyOn(getCurationSectionsMocks, "getCurationSections");
curationSection.mockImplementation(() => ({
  // @ts-expect-error ...
  settings: {
    id: "settings",
    fields: [
      {
        id: "title",
        required: true,
      },

      {
        id: "description",
        required: false,
      },
    ],
  },
}));

const translationSection = vi.spyOn(getTranslationSectionsMocks, "getTranslationSections");
translationSection.mockImplementation(() => ({
  // @ts-expect-error ...
  settings: {
    id: "settings",
    fields: [
      {
        id: "title",
        required: true,
      },

      {
        id: "description",
        required: false,
      },
    ],
  },
}));

const mediaSection = vi.spyOn(getMediaSectionsMocks, "getMediaSections");
mediaSection.mockImplementation(() => ({
  // @ts-expect-error ...
  settings: {
    id: "settings",
    fields: [
      {
        id: "title",
        required: true,
      },

      {
        id: "description",
        required: false,
      },
    ],
  },
}));

describe("getSidebarConfig", () => {
  test("should return the sidebar config for raw flow", () => {
    const language = "en";
    const flow = "raw" as AllowedRevisionFlow;
    const experienceId = "123";
    const revisionId = "456";
    const values = {
      title: "Test Title",
    };
    const options = {
      showNatGeoField: true,
    };

    const sidebarConfig = getSidebarConfig(language, flow, experienceId, revisionId, values, options);

    expect(sidebarConfig).toHaveProperty("items");
    expect(sidebarConfig).toHaveProperty("requiredFields");

    expect(rawSection).toHaveBeenCalledWith(
      `/experience/${experienceId}/revision/${revisionId}/${flow}`,
      values,
      options
    );
    expect(sidebarConfig.requiredFields).toEqual(["title"]);
  });

  test("should return the sidebar config for curation flow", () => {
    const language = "en";
    const flow = "curation";
    const experienceId = "123";
    const revisionId = "456";
    const values = {
      title: "Test Title",
    };
    const options = {
      showNatGeoField: true,
    };

    const sidebarConfig = getSidebarConfig(language, flow, experienceId, revisionId, values, options);

    expect(sidebarConfig).toHaveProperty("items");
    expect(sidebarConfig).toHaveProperty("requiredFields");

    expect(curationSection).toHaveBeenCalledWith(
      `/experience/${experienceId}/revision/${revisionId}/${flow}`,
      values,
      options
    );
    expect(sidebarConfig.requiredFields).toEqual(["title"]);
  });

  test("should return the sidebar config for translation flow", () => {
    const language = "en";
    const flow = "translation" as AllowedRevisionFlow;
    const experienceId = "123";
    const revisionId = "456";
    const values = {
      title: "Test Title",
    };
    const options = {
      showNatGeoField: true,
    };

    const sidebarConfig = getSidebarConfig(language, flow, experienceId, revisionId, values, options);

    expect(sidebarConfig).toHaveProperty("items");
    expect(sidebarConfig).toHaveProperty("requiredFields");

    expect(translationSection).toHaveBeenCalledWith(
      `/experience/${experienceId}/revision/${revisionId}/${flow}`,
      language,
      values
    );
    expect(sidebarConfig.requiredFields).toEqual(["title"]);
  });

  test("should return the sidebar config for media flow", () => {
    const language = "en";
    const flow = "media" as AllowedRevisionFlow;
    const experienceId = "123";
    const revisionId = "456";
    const values = {
      title: "Test Title",
    };
    const options = {
      showNatGeoField: true,
    };

    const sidebarConfig = getSidebarConfig(language, flow, experienceId, revisionId, values, options);

    expect(sidebarConfig).toHaveProperty("items");
    expect(sidebarConfig).toHaveProperty("requiredFields");

    expect(mediaSection).toHaveBeenCalledWith(`/experience/${experienceId}/revision/${revisionId}/${flow}`, values);
    expect(sidebarConfig.requiredFields).toEqual(["title"]);
  });

  test("should throw an error for unknown flow", () => {
    const language = "en";
    const flow = "unknown" as AllowedRevisionFlow;
    const experienceId = "123";
    const revisionId = "456";
    const values = {
      /* mock values */
    };
    const options = {
      /* mock options */
    };

    // Assert that the function throws an error
    expect(() => {
      getSidebarConfig(language, flow, experienceId, revisionId, values, options);
    }).toThrowErrorMatchingInlineSnapshot(`[Error: Could not get sidebar config for flow "unknown"]`);
  });
});
