import { describe, test, expect } from "vitest";
import { MountingOptions, VueWrapper, mount } from "@vue/test-utils";
import DiffHtml, { type DiffHtmlProps } from "../DiffHtml.vue";

let wrapper: VueWrapper<InstanceType<typeof DiffHtml>>;

const defaultProps: DiffHtmlProps = {
  value: `<p>AddedText Guided Tour in Barcelona</p>`,
  oldValue: `<p>Guided Tour in Barcelona remove me</p>`,
};

const render = (options: MountingOptions<DiffHtmlProps> = {}) => {
  wrapper = mount(DiffHtml, {
    props: defaultProps,
    ...options,
  });
};

describe("DiffText", () => {
  test("it should diff text", () => {
    render();

    // vitest auto updates snapshots https://vitest.dev/guide/snapshot#inline-snapshots
    expect(wrapper.html()).toMatchInlineSnapshot(`
      "<div class="diff-html">
        <p><ins class="_added_337734">AddedText </ins>Guided Tour in Barcelona<del class="_removed_337734"> remove me</del></p>
      </div>"
    `);
  });

  test("it should diff html elements", () => {
    render({
      props: {
        value: `<p>hello world new <ul><li>test</li><li>changed li</li><li>added li</li></ul></p>`,
        oldValue: `<p>hello world new <ul><li>test</li><li>replace li</li></ul></p>`,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`
      "<div class="diff-html">
        <p>hello world new </p>
        <ul>
          <li>test</li>
          <li><del class="_removed_337734">replace li</del><ins class="_added_337734">changed li</ins></li>
          <li class="_added_337734">added li</li>
        </ul>
        <p></p>
      </div>"
    `);
  });

  test("it should diff stylistic elements", () => {
    render({
      props: {
        value: `<p>hello <strong>bold</strong> <em>italic</em> <u>underline</u>`,
        oldValue: `<p>hello <strong>bold</strong> <u>underline</u> <em>removemeandmoveleft</em>`,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`
      "<div class="diff-html">
        <p>hello <strong>bold</strong> <ins class="_added_337734"><em>italic</em> </ins><u>underline</u><del class="_removed_337734"> <em>removemeandmoveleft</em></del></p>
      </div>"
    `);
  });
});
