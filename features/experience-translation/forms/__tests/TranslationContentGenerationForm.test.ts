import { mount, config, flushPromises } from "@vue/test-utils";
import { vi, describe, expect, test } from "vitest";
import TranslationContentGenerationForm, { Props } from "../TranslationContentGenerationForm.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const defaultProps: Props = {
  readonly: false,
  initialValues: {
    text1: "translated description",
    seo_description: "translated seo description",
    text2: "translated add description",
    custom_highlights: [],
    custom_important_information: [],
    custom_included: [],
    custom_non_included: [],
    premade_highlights: [],
    premade_important_information: [],
    premade_included: [],
    premade_non_included: [],
  },
  curationValues: {
    text1: "curation description",
    seo_description: "curation seo description",
    text2: "curation add description",
    custom_highlights: [],
    custom_important_information: [],
    custom_included: [],
    custom_non_included: [],
    premade_highlights: [],
    premade_important_information: [],
    premade_included: [],
    premade_non_included: [],
  },
  language: "es",
  hasDiff: false,
  diffValues: {},
};

const selectors = {
  editorialDescription: {
    selector: "#editorial-description",
    value: defaultProps.curationValues.text1,
  },
  translationDescription: {
    selector: "#translation-description",
    value: defaultProps.initialValues.text1,
  },
  editorialSeoDescription: {
    selector: "#editorial-seo-description",
    value: defaultProps.curationValues.seo_description,
  },
  translationSeoDescription: {
    selector: "#translation-seo-description",
    value: defaultProps.initialValues.seo_description,
  },
  editorialAdditionalDescription: {
    selector: "#editorial-additional-description",
    value: defaultProps.curationValues.text2,
  },
  translationAdditionalDescription: {
    selector: "#translation-additional-description",
    value: defaultProps.initialValues.text2,
  },
  editorialHighlights: {
    selector: '[data-testid="editorial-highlights"]',
    value: null,
  },
  translationHighlights: {
    selector: '[data-testid="translation-highlights"]',
    value: null,
  },
  editorialIncluded: {
    selector: '[data-testid="editorial-included"]',
    value: null,
  },
  translationIncluded: {
    selector: '[data-testid="translation-included"]',
    value: null,
  },
  editorialNonIncluded: {
    selector: '[data-testid="editorial-non_included"]',
    value: null,
  },
  translationNonIncluded: {
    selector: '[data-testid="translation-non_included"]',
    value: null,
  },
  editorialImportantInformation: {
    selector: '[data-testid="editorial-important_information"]',
    value: null,
  },
  translationImportantInformation: {
    selector: '[data-testid="translation-important_information"]',
    value: null,
  },
};

describe("TranslationContentGenerationForm", () => {
  test("it should be rendered correctly", async () => {
    const wrapper = mount(TranslationContentGenerationForm, {
      props: defaultProps,
    });

    await flushPromises();

    for (const [, item] of Object.entries(selectors)) {
      const { selector, value } = item;

      const field = wrapper.find(selector);

      expect(field.isVisible()).toBe(true);

      if (value) {
        expect(field.html()).toContain(value);
      }
    }
  });

  test("the premade highlights should hide correctly", async () => {
    const wrapper = mount(TranslationContentGenerationForm, {
      props: defaultProps,
    });

    await flushPromises();

    expect(wrapper.findAll(".HighlightWrapper .title").length).toBe(16);

    const switches = wrapper.findAll(".TranslationHighlightsSwitch > .NovaSwitch");

    expect(switches.length).toBe(4);

    for (const switchSelector of switches) {
      await switchSelector.trigger("click");

      await nextTick();

      // in every case the premade list should have a title, so we check for that
      expect(wrapper.findAll(".HighlightWrapper .title").length).toBe(14);

      await switchSelector.trigger("click");
    }
  });
});
