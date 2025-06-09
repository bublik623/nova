import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DiffText from "../DiffText.vue";
import type { Props } from "../DiffText.vue";

const props: Props = {
  value: `Awesome Guided Tour in Barcelona`,
  oldValue: `Guided tour in Barcelona!!`,
};

describe("DiffText", () => {
  test("it should render correctly", () => {
    const wrapper = mount(DiffText, { props });
    const spans = wrapper.findAll("span");
    expect(spans.length).toBe(6);
    expect(spans.at(0)?.classes()).toContain("green");
    expect(spans.at(1)?.classes().length).toBe(0);
    expect(spans.at(2)?.classes()).toContain("red");
    expect(spans.at(3)?.classes()).toContain("green");
    expect(spans.at(4)?.classes().length).toBe(0);
    expect(spans.at(5)?.classes()).toContain("red");
  });
});
