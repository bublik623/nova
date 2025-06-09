import { describe, test, expect } from "vitest";
import { MountingOptions, VueWrapper, mount } from "@vue/test-utils";
import SearchMatchHighlight, { type SearchMatchHighlightProps } from "./SearchMatchHighlight.vue";

let wrapper: VueWrapper<InstanceType<typeof SearchMatchHighlight>>;

const render = (options: MountingOptions<SearchMatchHighlightProps> = {}) => {
  wrapper = mount(SearchMatchHighlight, { ...options });
};

describe("SearchMatchHighlight", () => {
  test.each([{ highlight: "" }, {}, undefined])(
    "it should display the original text directly within the parent component if no highlight ig given",
    (props) => {
      render({
        slots: {
          default: "a title",
        },
        props,
      });

      expect(wrapper.text()).toBe("a title");
    }
  );

  test("it should display the html of the given highlight wrapped in a span with a scoped class", () => {
    render({
      slots: {
        default: "a title",
      },
      props: {
        highlight: "<em>match</em> value",
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot('"<span class="_highlight_aba1a4"><em>match</em> value</span>"');
  });
});
