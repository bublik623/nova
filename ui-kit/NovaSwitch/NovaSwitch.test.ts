import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaSwitch from "./NovaSwitch.vue";

describe("NovaSwitch", () => {
  test("it should mount and render correctly", async () => {
    const wrapper = mount(NovaSwitch, {
      props: {
        modelValue: false,
        disabled: false,
      },
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.attributes()["aria-checked"]).toBe("false");

    await wrapper.trigger("click");
    const events = wrapper.emitted<Event[]>()["update:modelValue"];

    expect(events).toBeTruthy();
    expect(events.length).toBe(1);
  });
});
