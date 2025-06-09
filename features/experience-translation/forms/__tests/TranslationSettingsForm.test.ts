import { AvailableLanguage } from "@/types/Language";
import { mount, config } from "@vue/test-utils";
import { testId } from "@/utils/test.utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TranslationSettingsForm from "../TranslationSettingsForm.vue";

interface Values {
  title?: string;
  seo_title?: string;
}

interface Props {
  initialValues: Values;
  curationValues: Values;
  language: AvailableLanguage;
  readonly: boolean;
}

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const defaultProps: Props = {
  initialValues: {
    title: "translated title",
    seo_title: "translated seo title",
  },
  curationValues: {
    title: "curation title",
    seo_title: "curation seo title",
  },
  language: "es",
  readonly: false,
};

const selectors = {
  translationTitle: {
    selector: "#translation-title-input",
    value: defaultProps.initialValues.title,
  },
  translationSeoTitle: {
    selector: "#translation-seo-title-input",
    value: defaultProps.initialValues.seo_title,
  },
};

describe("TranslationSettingsForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("it should be rendered correctly", () => {
    const wrapper = mount(TranslationSettingsForm, { props: defaultProps });
    for (const [, item] of Object.entries(selectors)) {
      const { selector, value } = item;

      const { element }: { element: HTMLInputElement } = wrapper.find(selector);

      expect(element.value).toBe(value);
    }
    expect(wrapper.find(testId("editorial-title-input-input-text-readonly")).text()).toBe("curation title");
    expect(wrapper.find(testId("editorial-seo-title-input-input-text-readonly")).text()).toBe("curation seo title");
  });

  test("it should emit on valid data", async () => {
    const wrapper = mount(TranslationSettingsForm, { props: defaultProps });

    const translationTitle = wrapper.find(selectors.translationTitle.selector);
    await translationTitle.setValue("my new translated title!");

    // Wait for the validation to take place
    vi.advanceTimersByTime(300);

    // @ts-expect-error as always...
    const event = wrapper.emitted()["update:modelValue"][0][0];

    expect(event.title).toBe("my new translated title!");
  });

  test("it should ALSO emit on invalid data", async () => {
    const wrapper = mount(TranslationSettingsForm, { props: defaultProps });

    const translationTitle = wrapper.find(selectors.translationTitle.selector);
    await translationTitle.setValue("!");

    // Wait for the validation to take place
    vi.advanceTimersByTime(300);

    // @ts-expect-error as always...
    const event = wrapper.emitted()["update:modelValue"][0][0];

    expect(event.title).toBe("!");
  });
});
