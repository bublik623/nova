import { config, shallowMount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import RevisionVisualsForm from "../RevisionVisualsForm.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

describe("RevisionVisualsForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should pass the correct props to the image gallery", () => {
    const wrapper = shallowMount(RevisionVisualsForm, {
      props: {
        flow: "media",
        form: "visuals",
        options: {},
        values: {
          images: [
            { id: "1", preview_url: "https://example.com/image1.jpg", name: "image1.jpg", visualization_order: 1 },
            { id: "2", preview_url: "https://example.com/image2.jpg", name: "image2.jpg", visualization_order: 2 },
          ],
        },
        requiredFields: [],
      },
    });

    expect(wrapper.findComponent({ name: "NovaImageGallery" }).props()).toMatchInlineSnapshot(`
      {
        "ctaText": undefined,
        "disabled": false,
        "modelValue": [
          {
            "id": "1",
            "name": "image1.jpg",
            "preview_url": "https://example.com/image1.jpg",
            "visualization_order": 1,
          },
          {
            "id": "2",
            "name": "image2.jpg",
            "preview_url": "https://example.com/image2.jpg",
            "visualization_order": 2,
          },
        ],
        "readonly": true,
      }
    `);
  });
});
