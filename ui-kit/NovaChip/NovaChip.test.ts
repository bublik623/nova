import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import NovaChip from "./NovaChip.vue";

const slots = { default: "02/03/01" };

describe("NovaChip", () => {
  test("it should be rendered correctly", () => {
    const wrapper = mount(NovaChip, { slots });

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.html()).include("02/03/01");
  });

  test("if the user click on the close btn it should emit an event", async () => {
    const wrapper = mount(NovaChip, { slots });

    await wrapper.find("button.NovaChip__button").trigger(`click`);

    const events = wrapper.emitted<Event[]>()["click:close"];

    expect(events).toBeTruthy();
    expect(events.length).toBe(1);
  });
});
