import { mount, config } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import NewHighlight, { Props } from "../NewHighlight.vue";

config.global.mocks = {
  $t: (text: string) => text,
  uuid: () => Math.floor(Math.random() * 10000).toString(),
};

const props: Props = {
  visualizationOrder: 15,
  disabled: false,
  placeholder: "Do the thing!",
};

describe("NewHighlight", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NewHighlight, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(".InputText__input").isVisible()).toBe(true);
    expect(wrapper.find(".newValueButton").isVisible()).toBe(true);
  });

  test("it should emit correctly", async () => {
    const wrapper = mount(NewHighlight, { props });

    await wrapper.find(".InputText__input").setValue("My new highlight!");
    await wrapper.find(".newValueButton").trigger("click");

    // @ts-expect-error...
    expect(wrapper.emitted()["create:new-highlight"][0][0].name).toBe("My new highlight!");
    // @ts-expect-error...
    expect(wrapper.emitted()["create:new-highlight"][0][0].action).toBe("CREATE");
    // @ts-expect-error...
    expect(wrapper.emitted()["create:new-highlight"][0][0].visualization_order).toBe(15);
    // @ts-expect-error...
    expect(wrapper.emitted()["create:new-highlight"][0][0].language_code).toBe("en");
  });
});
