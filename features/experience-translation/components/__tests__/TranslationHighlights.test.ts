import { config, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import TranslationHighlights from "../TranslationHighlights.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const testHighlights = [
  {
    id: "462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7",
    name: "My custom highlight 1",
    language_code: "en",
    visualization_order: 0,
  },
  {
    id: "fde07d18-22d5-4b25-8699-56227c5abecb",
    name: "My custom highlight 2",
    language_code: "en",
    visualization_order: 1,
  },
];

const selectors = {
  row: '[data-testid="translation-highlight-row"]',
  emptyList: '[data-testid="translation-highlight-empty-list"]',
  simpleList: '[data-testid="translation-highlight-simple-list"]',
  premadeList: '[data-testid="translation-highlight-premade-list"]',
  translationList: '[data-testid="translation-highlight-translation-list"]',
};

describe("TranslationHighlights", () => {
  test("when premade and custom are passed, it should be rendered correctly", () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: testHighlights,
        premadeItems: testHighlights,
        showPremade: true,
      },
    });
    expect(wrapper.html()).include("experience.highlights.custom.title");
    expect(wrapper.html()).include("experience.highlights.premade.title");

    expect(wrapper.find(selectors.premadeList).exists()).toBe(true);
    expect(wrapper.find(selectors.translationList).exists()).toBe(true);
  });

  test("when only custom are passed, it should be rendered correctly", () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: testHighlights,
        premadeItems: [],
        showPremade: true,
      },
    });

    expect(wrapper.findAll(selectors.emptyList).length).toBe(1);
    expect(wrapper.find(selectors.translationList).exists()).toBe(true);
  });

  test("when only premade are passed, it should be rendered correctly", () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: [],
        premadeItems: testHighlights,
        showPremade: true,
      },
    });

    expect(wrapper.findAll(selectors.emptyList).length).toBe(1);
    expect(wrapper.find(selectors.premadeList).exists()).toBe(true);
  });

  test("when premade are passed but hidden, it should be rendered correctly", () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: [],
        premadeItems: testHighlights,
        showPremade: false,
      },
    });

    expect(wrapper.findAll(selectors.emptyList).length).toBe(1);
    expect(wrapper.find(selectors.premadeList).exists()).toBe(false);
  });

  test("when none are passed, it should be rendered correctly", () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: [],
        premadeItems: [],
        showPremade: true,
      },
    });
    expect(wrapper.findAll(selectors.emptyList).length).toBe(2);
  });

  test("when it's disabled, it should be rendered correctly", () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: testHighlights,
        premadeItems: testHighlights,
        disabled: true,
        showPremade: true,
      },
    });
    expect(wrapper.html()).include("experience.highlights.custom.title");
    expect(wrapper.html()).include("experience.highlights.premade.title");

    expect(wrapper.findAll(selectors.simpleList).length).toBe(2);
  });

  test("it should emit correctly when a field is changed", async () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: testHighlights,
        premadeItems: testHighlights,
        showPremade: true,
      },
    });
    const selector = `[data-testid="${testHighlights[0].id}-input-text"]`;
    const input = () => wrapper.find<HTMLInputElement>(selector);

    await input().setValue("Updated name!");

    // @ts-expect-error as always...
    const event = wrapper.emitted()["update:modelValue"][0][0];

    expect(event).toStrictEqual([
      {
        id: "462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7",
        name: "Updated name!",
        language_code: "en",
        visualization_order: 0,
        action: "EDIT",
      },
      {
        id: "fde07d18-22d5-4b25-8699-56227c5abecb",
        name: "My custom highlight 2",
        language_code: "en",
        visualization_order: 1,
      },
    ]);
  });

  test("it should display an error if a field name is empty", async () => {
    const wrapper = mount(TranslationHighlights, {
      props: {
        modelValue: [
          {
            id: "462f8d6d-9bc2-413b-8a2c-dc7b03ae17d7",
            name: "",
            language_code: "en",
            visualization_order: 0,
          },
        ],
        premadeItems: testHighlights,
        showPremade: true,
      },
    });

    expect(wrapper.find(".InputText__error-msg").exists()).toBe(true);
    expect(wrapper.html()).toContain("Name cannot be blank");
  });
});
