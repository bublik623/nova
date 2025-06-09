import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ExperienceActionDropdown from "@/features/experience-shared/components/ExperienceActionDropdown.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

const selectors = {
  edit: "[data-testid='experience-action-edit']",
  publish: "[data-testid='experience-action-publish']",
  unpublish: "[data-testid='experience-action-unpublish']",
  toggle: "[data-testid='experience-action-toggle']",
};

describe("ExperienceActionDropdown.vue", () => {
  beforeEach(() => {
    // create teleport target
    beforeEach(() => {
      document.body.innerHTML = `<div id="root"></div>`;
    });
  });

  test('shows "Edit" option when status is "draft"', async () => {
    const wrapper = mount(ExperienceActionDropdown, {
      props: { status: "draft" },
      attachTo: "body",
    });

    await wrapper.find(selectors.toggle).trigger("click");

    expect(document.body.innerHTML).toContain("experience-action-edit");
    expect(document.body.innerHTML).not.toContain("experience-action-publish");
    expect(document.body.innerHTML).not.toContain("experience-action-unpublish");
  });

  test('shows "Publish" and "edit" option when status is unpublished and curationStatus and mediaStatus are ready"', async () => {
    const wrapper = mount(ExperienceActionDropdown, {
      props: { status: "unpublished", curationStatus: "READY", mediaStatus: "READY" },
      attachTo: "body",
    });

    await wrapper.find(selectors.toggle).trigger("click");

    expect(document.body.innerHTML).toContain("experience-action-publish");
    expect(document.body.innerHTML).toContain("experience-action-edit");
    expect(document.body.innerHTML).not.toContain("experience-action-unpublish");
  });

  test('shows "Unpublish" and "Edit" option when status is "ready"', async () => {
    const wrapper = mount(ExperienceActionDropdown, {
      props: { status: "ready" },
      attachTo: "body",
    });

    await wrapper.find(selectors.toggle).trigger("click");

    expect(document.body.innerHTML).toContain("experience-action-unpublish");
    expect(document.body.innerHTML).toContain("experience-action-edit");
    expect(document.body.innerHTML).not.toContain("experience-action-publish");
  });
});
