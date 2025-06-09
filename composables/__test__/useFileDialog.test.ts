import { h, defineComponent } from "vue";
import { describe, test, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { useFileDialog } from "../useFileDialog";

const WrapperComponent = defineComponent({
  setup: () => {
    const { files, openDialog, _input } = useFileDialog();
    const inputElement = _input;

    return {
      files,
      openDialog,
      inputElement,
    };
  },
  render() {
    return h("div", [
      h("button", { onClick: () => this.openDialog({ accept: "image/*" }) }),
      ...this.files.map((f) => h("span", f.name)),
    ]);
  },
});

describe("useFileDialog", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="root"></div>`;
  });

  test("it appends an hidden input to the body when mounted", () => {
    expect(document.body.innerHTML).not.toContain("input");

    mount(WrapperComponent, { attachTo: "#root" });

    expect(document.body.innerHTML).toContain("input");
  });

  test("it removes the input when the component is unmounted", () => {
    const wrapper = mount(WrapperComponent, { attachTo: "#root" });
    expect(document.body.innerHTML).toContain("input");

    wrapper.unmount();
    expect(document.body.innerHTML).not.toContain("input");
  });

  describe("when a file is added", () => {
    test("it should update the 'files' list", async () => {
      const wrapper = mount(WrapperComponent, { attachTo: "#root" });

      await wrapper.find("button").trigger("click");

      if (wrapper.vm.inputElement?.onchange) {
        wrapper.vm.inputElement.onchange({
          target: {
            files: [new File(["test"], "test-1.jpg"), new File(["test"], "test-2.jpg")],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      }
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll("span").length).toBe(2);
      expect(wrapper.findAll("span")[0].text()).toBe("test-1.jpg");
      expect(wrapper.findAll("span")[1].text()).toBe("test-2.jpg");
    });
  });
});
