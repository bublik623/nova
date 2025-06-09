import { VueWrapper, config, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import RevisionContentSegmentationForm from "../RevisionContentSegmentationForm.vue";
import RawHighlights from "@/features/experience-raw/components/RawHighlights.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
};

const masterDataStoreMock = {
  getAdditionalServicesByFGCode: vi.fn(() => []),
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

const selectors = {
  seoDescriptionField: "[data-testid='revision-content-segmentation-form-seo-description']",
};

describe("RevisionContentSegmentationForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should render the raw form correctly", () => {
    const wrapper = mount(RevisionContentSegmentationForm, {
      props: {
        flow: "raw",
        form: "settings",
        options: {},
        values: {},
        requiredFields: [],
      },
    });

    commonFormTests(wrapper);

    // it should not show the seo_description field
    expect(wrapper.find(selectors.seoDescriptionField).exists()).toBe(false);
  });

  test("it should render the curation form correctly", () => {
    const wrapper = mount(RevisionContentSegmentationForm, {
      props: {
        flow: "curation",
        form: "settings",
        options: {},
        values: {},
        requiredFields: [],
      },
    });

    commonFormTests(wrapper);

    // it should show the seo_description field
    expect(wrapper.find(selectors.seoDescriptionField).exists()).toBe(true);
  });
});

function commonFormTests(wrapper: VueWrapper<any>) {
  expect(masterDataStoreMock.getAdditionalServicesByFGCode).toHaveBeenNthCalledWith(1, "DURATION");
  expect(masterDataStoreMock.getAdditionalServicesByFGCode).toHaveBeenNthCalledWith(2, "FEATURES");
  expect(wrapper.findAllComponents(RawHighlights)).toHaveLength(4);
}
