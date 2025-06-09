import { describe, test, expect } from "vitest";

import { RevisionValues } from "../../types/revision";
import RevisionVisualsForm from "../../components/RevisionVisualsForm.vue";
import { getMediaForms, getMediaSections } from "../media.config";

describe("getMediaFOrms", () => {
  test("should return the correct forms", () => {
    const values = {
      title: "Test Title",
    };
    const options = {
      showNatGeoField: true,
    };

    const requiredFields = ["gallery"];

    const forms = getMediaForms(values, options, requiredFields);

    expect(forms.visuals.is).toBe(RevisionVisualsForm);
    expect(forms.visuals.props.values).toBe(values);
    expect(forms.visuals.props.options).toBe(options);
    expect(forms.visuals.props.requiredFields).toBe(requiredFields);
  });
});

describe("getMediaSections", () => {
  test("should return the correct sections", () => {
    const baseUrl = "/base-url";
    const values: RevisionValues = {
      images: [
        {
          id: "Test Image ID",
          visualization_order: 1,
          preview_url: "Test Image URL",
          name: "Test Image Name",
        },
        {
          id: "Test Image ID 2",
          visualization_order: 2,
          preview_url: "Test Image URL 2",
          name: "Test Image Name 2",
        },
      ],
    };

    const sections = getMediaSections(baseUrl, values);

    expect(sections).toMatchInlineSnapshot(`
      {
        "visuals": {
          "completed": true,
          "disabled": false,
          "disabledBy": undefined,
          "dropdown": true,
          "fields": [
            {
              "filled": true,
              "id": "gallery",
              "required": true,
            },
          ],
          "icon": "gallery",
          "id": "visuals",
          "required": true,
          "url": "/base-url/visuals",
        },
      }
    `);
  });
});
