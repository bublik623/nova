import { config, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import RevisionSettingsForm from "../RevisionSettingsForm.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (s: string) => s,
};

const masterDataStoreMock = {
  getAdditionalServicesByFGCode: vi.fn(() => []),
  getCategoriesAndInterests: vi.fn(),
  experienceCategories: [],
  experienceInterests: [],
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));

const selectors = {
  seoTitleField: "[data-testid='revision-settings-form-seo-title']",
};

describe("RevisionSettingsForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should render the raw form correctly", () => {
    const wrapper = mount(RevisionSettingsForm, {
      props: {
        flow: "raw",
        form: "settings",
        options: {},
        values: {},
        requiredFields: [],
      },
    });

    commonFormTests();

    // it should not show the seo_description field
    expect(wrapper.find(selectors.seoTitleField).exists()).toBe(false);
  });

  test("it should render the curation form correctly", () => {
    const wrapper = mount(RevisionSettingsForm, {
      props: {
        flow: "curation",
        form: "settings",
        options: {},
        values: {},
        requiredFields: [],
      },
    });

    commonFormTests();

    // it should show the seo_description field
    expect(wrapper.find(selectors.seoTitleField).exists()).toBe(true);
  });
});

function commonFormTests() {
  expect(masterDataStoreMock.getAdditionalServicesByFGCode).toHaveBeenNthCalledWith(1, "PROMOTIONAL_OPTIONS");
  expect(masterDataStoreMock.getAdditionalServicesByFGCode).toHaveBeenNthCalledWith(2, "PRODUCT_BRAND");
  expect(masterDataStoreMock.getAdditionalServicesByFGCode).toHaveBeenNthCalledWith(3, "OWN_OFFER");

  expect(masterDataStoreMock.getCategoriesAndInterests).toHaveBeenCalledTimes(1);
}
