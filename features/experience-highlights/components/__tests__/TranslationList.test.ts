import { config, mount } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import TranslationList, { Props } from "../TranslationList.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  modelValue: [
    {
      name: "Speedboat ride",
      action: "NOOP",
      id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
      visualization_order: 0,
      language_code: "en",
    },
    {
      name: "Sunset cruise",
      action: "NOOP",
      id: "f0f7a379-ecd5-4032-854a-21d12cd6dc63",
      visualization_order: 1,
      language_code: "en",
    },
    {
      id: "3fd33674-884e-4fad-ba2d-e0ec3547eecf",
      name: "River Cruise",
      action: "NOOP",
      visualization_order: 2,
      language_code: "en",
    },
  ],
};

const selectors = {
  listItem: ".TranslationHighlight__ListItem",
  textInput: ".InputText__input",
  errorMessage: ".InputText__error-msg",
};

describe("TranslationList", () => {
  test("it renders correctly", () => {
    const wrapper = mount(TranslationList, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.findAll(selectors.listItem).length).toBe(3);
  });

  test("it shows an error if the title is empty", async () => {
    const wrapper = mount(TranslationList, {
      props: {
        modelValue: [
          {
            name: "",
            action: "NOOP",
            id: "9a496345-148e-4460-93a4-8f9ac9be79b2",
            visualization_order: 0,
            language_code: "en",
          },
        ],
      },
    });

    await wrapper.find(selectors.textInput).setValue(null);

    expect(wrapper.find(selectors.errorMessage).isVisible()).toBe(true);
  });

  test("it emits correctly", async () => {
    const wrapper = mount(TranslationList, { props });

    await wrapper.find(selectors.textInput).setValue("Updated title!");

    // @ts-expect-error...
    expect(wrapper.emitted()["update:modelValue"][0][0][0].name).toBe("Updated title!");
  });
});
