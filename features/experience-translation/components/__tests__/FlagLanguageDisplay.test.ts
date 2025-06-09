import { mount, config } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import FlagLanguageDisplay from "../FlagLanguageDisplay.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("FlagLanguageDisplay", () => {
  test("it should be rendered correctly", () => {
    const wrapper = mount(FlagLanguageDisplay, {
      props: {
        countryCode: "it",
      },
    });

    expect(wrapper.html()).include('class="NovaIconFlag"');
    expect(wrapper.html()).include('shape="circle"');
    expect(wrapper.html()).include("common.language.it");
  });
});
