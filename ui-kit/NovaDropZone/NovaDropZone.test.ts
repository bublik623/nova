import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NovaDropZone, { Props } from "./NovaDropZone.vue";

const selectors = {
  input: "[data-testid='nova-drop-zone-input']",
};

const options = {
  maxSize: 10,
  acceptedFiles: "image/*",
};
const props: Props = {
  options,
};

vi.mock("attr-accept", () => ({
  default: (file: File) => file.type === options.acceptedFiles && file.size <= options.maxSize,
}));

describe("NovaDropZone", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaDropZone, { props });
    const input = wrapper.find(selectors.input);

    expect(wrapper).toBeTruthy();
    expect(input.exists()).toBe(true);
    expect(input.attributes().accept).toBe(options.acceptedFiles);
    expect(wrapper.text()).toBe("Upload file");
  });

  test("it should render the slot content", () => {
    const wrapper = mount(NovaDropZone, { slots: { default: "test content" } });
    expect(wrapper.text()).toBe("test content");
  });

  describe("when a file is dropped on the component", () => {
    describe("if multiple files are dropped", () => {
      test("it should emit an error", async () => {
        const wrapper = mount(NovaDropZone, { props });

        await wrapper.trigger("drop", {
          dataTransfer: { files: [{}, {}] },
        });

        const events = wrapper.emitted<Event[]>().error;
        expect(events).toBeTruthy();
        expect(events[0][0]).toBe("You can only upload one item");
      });
    });

    describe("if the file is accepted", () => {
      test("it should emit an event", async () => {
        const file = {
          size: options.maxSize - 1,
        };
        const wrapper = mount(NovaDropZone);

        await wrapper.trigger("drop", {
          dataTransfer: { files: [file] },
        });

        const events = wrapper.emitted<Event[]>()["file:added"];
        expect(events).toBeTruthy();
        expect(events[0][0]).toStrictEqual(file);
      });
    });

    describe("if the file is rejected", () => {
      test("it should emit an event", async () => {
        const wrapper = mount(NovaDropZone, { props });

        await wrapper.trigger("drop", {
          dataTransfer: { files: [{ size: 100 }] },
        });

        const events = wrapper.emitted<Event[]>()["file:rejected"];
        expect(events).toBeTruthy();
        expect(events[0][0]).toStrictEqual(["File extension not supported", "The maximum supported size is 0.0001MB."]);
      });
    });
  });
});
