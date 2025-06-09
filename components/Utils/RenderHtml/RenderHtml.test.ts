import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RenderHtml from "./RenderHtml.vue";
import type { Props } from "./RenderHtml.vue";

const props: Props = {
  string: `<p>hello world!</p>`,
};
describe("RenderHtml", () => {
  test("it should render correctly", () => {
    const wrapper = mount(RenderHtml, { props });
    expect(wrapper.find("span").text()).toBe("hello world!");
    expect(wrapper.find("span").text()).not.contain("<p>");
  });
});
