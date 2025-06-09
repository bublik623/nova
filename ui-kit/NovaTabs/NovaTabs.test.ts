import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaTabs, { Props } from "./NovaTabs.vue";

const props: Props = {
  options: [
    { title: "Curation", value: "http://experience-curation" },
    { title: "Media", value: "http://experience-media" },
  ],
  selected: { title: "Curation", value: "http://experience-curation" },
};

const selectors = {
  container: "[data-testid='nova-tabs']",
  item: "[data-testid='nova-tabs-item']",
};

describe("NovaTabs", () => {
  const wrapper = mount(NovaTabs, { props });
  const container = wrapper.find(selectors.container);
  const items = wrapper.findAll(selectors.item);

  test("it should mount and render correctly", () => {
    expect(NovaTabs).toBeTruthy();

    expect(container.text()).toContain(props.options[0].title + props.options[1].title);
    expect(items.length).toBe(2);
  });
});

describe("when one of the option is clicked", () => {
  test("it should emit an event", () => {
    const wrapper = mount(NovaTabs, { props });
    const items = wrapper.findAll(selectors.item);
    items[1].trigger("click");

    const events = wrapper.emitted<Event[]>()["select:option"];
    expect(events[0][0]).toEqual(props.options[1]);
  });
});

describe("If an option is selected", () => {
  test("it should have the 'selected' class", () => {
    const wrapper = mount(NovaTabs, { props });
    const items = wrapper.findAll(selectors.item);
    expect(items[0].attributes("selected")).toBe("true");
    expect(items[1].attributes("selected")).toBe(undefined);
  });
});
