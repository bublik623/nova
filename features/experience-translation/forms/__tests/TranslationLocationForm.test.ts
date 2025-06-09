import { AvailableLanguage } from "@/types/Language";
import { mount, config } from "@vue/test-utils";

import { beforeEach, describe, expect, test, vi } from "vitest";
import TranslationLocationForm, { TranslationLocationValues } from "../TranslationLocationForm.vue";

interface Props {
  initialValues: TranslationLocationValues;
  curationValues: TranslationLocationValues;
  language: AvailableLanguage;
}

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const defaultProps: Props = {
  initialValues: {
    meeting_point_details: "translated title",
  },
  curationValues: {
    meeting_point_details: "curation title",
  },
  language: "es",
};

const selectors = {
  editorialMeetingPoint: {
    selector: "#editorial-meeting-point",
    value: defaultProps.curationValues.meeting_point_details,
  },
  translationMeetingPoint: {
    selector: "#translation-meeting-point",
    value: defaultProps.initialValues.meeting_point_details,
  },
};

describe("TranslationSettingsForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  test("it should be rendered correctly", () => {
    const wrapper = mount(TranslationLocationForm, { props: defaultProps });

    for (const [, item] of Object.entries(selectors)) {
      const { selector } = item;

      const { element }: { element: HTMLInputElement } = wrapper.find(selector);

      // we cannot test text editors...
      expect(element).toBeTruthy();
    }
  });
});
