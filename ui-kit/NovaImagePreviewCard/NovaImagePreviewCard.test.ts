import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import NovaImagePreviewCard, { Props } from "./NovaImagePreviewCard.vue";

const selectors = {
  button: "[data-testid='nova-button-icon']",
  image: "[data-testid='nova-image-preview-card-image']",
  filename: "[data-testid='nova-image-preview-card-name']",
};

config.global.stubs = {
  NovaDropZone: {
    template: "<div data-testid='nova-drop-zone'></div>",
  },
};

const props: Props = {
  image: {
    name: "test-img.jpg",
    id: "test-id",
    preview_url: "test-url",
    visualization_order: 0,
  },
};

describe("NovaImagePreviewCard", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaImagePreviewCard, { props });

    expect(wrapper).toBeTruthy();

    const buttons = wrapper.findAll(selectors.button);
    expect(buttons.length).toBe(1);

    expect(wrapper.find(selectors.filename).text()).toBe(props.image.name);
    expect(wrapper.find(selectors.image).exists()).toBe(true);
    expect(wrapper.find(selectors.image).attributes().src).toBe("test-url");
  });

  describe("when the image name is longer than 20 char", () => {
    test("it should clip the name", () => {
      const wrapper = mount(NovaImagePreviewCard, {
        props: {
          image: { ...props.image, name: "a-very-long-name-for-a-file.jpg" },
        },
      });

      expect(wrapper).toBeTruthy();

      const buttons = wrapper.findAll(selectors.button);
      expect(buttons.length).toBe(1);

      expect(wrapper.find(selectors.filename).text()).toBe("a-very-long-name-fo... jpg");
    });
  });

  describe("when the user clicks on the remove button", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImagePreviewCard, { props });

      const buttons = wrapper.findAll(selectors.button);
      await buttons[0].trigger("click");

      const events = wrapper.emitted<Event[]>()["click:delete"];
      expect(events).toBeTruthy();
    });
  });

  describe("if is disabled", () => {
    test("the button should be not clickable", async () => {
      const wrapper = mount(NovaImagePreviewCard, { props: { ...props, disabled: true } });

      const buttons = wrapper.findAll(selectors.button);
      expect(buttons[0].attributes("disabled")).toBe("");
    });
  });

  describe("if is readonly", () => {
    test("the button should be not clickable", async () => {
      const wrapper = mount(NovaImagePreviewCard, { props: { ...props, readonly: true } });

      const buttons = wrapper.findAll(selectors.button);
      expect(buttons.length).toBe(0);
    });
  });
});
