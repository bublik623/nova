import { describe, expect, test } from "vitest";
import OptionLanguagesDropdown from "../OptionLanguagesDropdown.vue";
import { shallowMount } from "@vue/test-utils";
import RenderHtml from "@/components/Utils/RenderHtml/RenderHtml.vue";
import MultiSelect from "@/features/stop-sales/components/MultiSelect/MultiSelect.vue";

describe("OptionLanguagesDropdown", () => {
  test("it should render the multiselect component when readonly is false", () => {
    const wrapper = shallowMount(OptionLanguagesDropdown, {
      props: {
        isReadonly: false,
        selectedItems: [
          {
            label: "en",
            val: "en",
          },
          {
            label: "it",
            val: "it",
          },
        ],
      },
    });

    const multiSelectComponent = wrapper.findComponent(MultiSelect);

    expect(multiSelectComponent.isVisible()).toBe(true);
  });

  test("it should render the list of languages when readonly is true", () => {
    const wrapper = shallowMount(OptionLanguagesDropdown, {
      global: {
        renderStubDefaultSlot: true,
      },
      props: {
        isReadonly: true,
        selectedItems: [
          {
            label: "en",
            val: "en",
          },
          {
            label: "it",
            val: "it",
          },
        ],
      },
    });

    const renderHtmlComponent = wrapper.findComponent(RenderHtml);

    expect(renderHtmlComponent.props().string).toBe("en, it");
  });
});
