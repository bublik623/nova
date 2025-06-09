import { config, mount } from "@vue/test-utils";
import { nextTick } from "vue";

import OptionLanguagesDropdown, {
  LanguageOption,
} from "@/features/experience-calendar/components/OptionLanguagesDropdown.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { describe, expect, it, vi } from "vitest";
import FieldLanguages from "../FieldLanguages.vue";

vi.mock("@/features/experience-calendar/utils/option-language-utils", () => ({
  mapMasterdataLanguagesToOptions: () => langArray,
}));
const langArray = ["lang-1", "lang-2", "lang-3"];
vi.mock("@/stores/master-data", () => ({
  useMasterData: () => ({ availableLanguages: langArray }),
}));

vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));
config.global.mocks = { $t: (text: string) => text };
vi.stubGlobal("useId", () => "1");

const languagesArray: LanguageOption[] = [
  { label: "language-1", val: "lang-1" },
  { label: "language-2", val: "lang-2" },
  { label: "language-3", val: "lang-3" },
];

describe("FieldLanguages", () => {
  let wrapper: ReturnType<typeof mount>;

  const mountComponent = (initial: LanguageOption[]) => {
    wrapper = mount(FieldLanguages, {
      props: { modelValue: initial, id: "test-id" },
      global: {
        components: { OptionLanguagesDropdown, NovaInputRadioGroup },
      },
    });
  };

  const testIds = {
    dropdown: '[data-testid="option-languages-input-search"]',
    radioYes: '[data-testid="input-radio-true"]',
    radioNo: '[data-testid="input-radio-false"]',
  };

  it("shows the dropdown when modelValue is non-empty", () => {
    mountComponent([languagesArray[0]]);
    expect(wrapper.find(testIds.dropdown).exists()).toBe(true);
  });

  it("hides the dropdown when modelValue is empty", () => {
    mountComponent([]);
    expect(wrapper.find(testIds.dropdown).exists()).toBe(false);
  });

  describe('by clicking the "No" radio', () => {
    it("hides the dropdown and emits empty array", async () => {
      mountComponent([languagesArray[1]]);
      await wrapper.find(testIds.radioNo).setChecked();
      await nextTick();

      expect(wrapper.find(testIds.dropdown).exists()).toBe(false);
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeDefined();
      expect(emitted![0]).toEqual([[]]);
    });
  });

  describe('by clicking the "Yes" radio', () => {
    it("shows the dropdown", async () => {
      mountComponent([]);
      await wrapper.find(testIds.radioYes).setChecked();
      await nextTick();

      expect(wrapper.find(testIds.dropdown).exists()).toBe(true);
    });

    it("resets modelValue to initial values after toggling No then Yes", async () => {
      mountComponent(languagesArray);
      await wrapper.find(testIds.radioNo).setChecked();
      await nextTick();
      await wrapper.find(testIds.radioYes).setChecked();
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toHaveLength(2);
      expect(emitted![1]).toEqual([languagesArray]);
    });
  });
});
