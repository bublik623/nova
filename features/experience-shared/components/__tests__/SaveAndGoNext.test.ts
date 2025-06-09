import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { mount, config } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import SaveAndGoNext from "../SaveAndGoNext.vue";

config.global.mocks = {
  $t: (t: string) => t,
};

describe("SaveAndGoNext", () => {
  test('emits "click:navigate" event when the button is clicked and readonly is true', async () => {
    const wrapper = mount(SaveAndGoNext, {
      props: {
        loading: false,
        readonly: true,
        disabled: false,
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("click:navigate")).toBeTruthy();
  });

  test('emits "click:save-and-navigate" event when the button is clicked and readonly is false', async () => {
    const wrapper = mount(SaveAndGoNext, {
      props: {
        loading: false,
        readonly: false,
        disabled: false,
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("click:save-and-navigate")).toBeTruthy();
  });

  test("disables the button when the disabled prop is true", async () => {
    const wrapper = mount(SaveAndGoNext, {
      props: {
        loading: false,
        readonly: false,
        disabled: true,
      },
    });

    expect(wrapper.findComponent(NovaButton).attributes("disabled")).toBe("");
  });
});
