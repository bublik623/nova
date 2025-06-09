import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import NovaImageUpload, { Props } from "./NovaImageUpload.vue";
import NovaImagePreview from "@/ui-kit/NovaImagePreview/NovaImagePreview.vue";
import NovaDropZone from "@/ui-kit/NovaDropZone/NovaDropZone.vue";

const selectors = {
  imagePreview: NovaImagePreview,
  dropZone: NovaDropZone,
  buttons: "[data-testid='nova-button']",
};

config.global.stubs = {
  NovaDropZone: {
    template: "<div data-testid='nova-drop-zone'></div>",
  },
};

const props: Props = {
  modelValue: {
    name: "test-img.jpg",
    id: "test-id",
    url: "test-url",
    media_type: "image/*",
    visualization_order: 0,
  },
  isCover: true,
};

const useFileDialogMock = {
  openDialog: vi.fn(),
  files: {
    value: [
      {
        name: "newImage.jpg",
        type: "image/jpg",
        original_file: new File(["test"], "newImage.jpg"),
      },
    ],
  },
};

vi.mock("@/composables/useFileDialog", () => ({
  useFileDialog: () => useFileDialogMock,
}));

vi.stubGlobal("URL", {
  createObjectURL: vi.fn(),
});

describe("NovaImageUpload", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaImageUpload, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.findComponent(selectors.imagePreview).exists()).toBe(true);
    expect(wrapper.findComponent(selectors.dropZone).exists()).toBe(true);
    expect(wrapper.findComponent(selectors.dropZone).isVisible()).toBe(false);
  });

  describe("when an image is added", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImageUpload, { props });

      await wrapper.findComponent(selectors.dropZone).trigger("file:added");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBeTruthy();
    });
  });

  describe("when the image is edited", () => {
    test("it should emit an event with the updated image", async () => {
      const wrapper = mount(NovaImageUpload, { props });

      await wrapper.findAll(selectors.buttons)[0].trigger("click");

      expect(useFileDialogMock.openDialog).toHaveBeenCalledWith({
        accept: "image/*",
        multiple: false,
      });
      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toStrictEqual({
        id: "newImage.jpg",
        is_cover: true,
        media_type: "image/jpg",
        name: "newImage.jpg",
        original_file: {
          name: "newImage.jpg",
          original_file: new File(["test"], "newImage.jpg"),
          type: "image/jpg",
        },
        url: undefined,
        visualization_order: 0,
      });
    });
  });

  describe("when the image is deleted", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImageUpload, { props });

      await wrapper.findAll(selectors.buttons)[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBe(null);
    });
  });
});
