import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import NovaImagePreview, { Props } from "./NovaImagePreview.vue";

const selectors = {
  button: "[data-testid='nova-button']",
  image: "[data-testid='nova-image-preview-image']",
  filename: "[data-testid='nova-image-preview-name']",
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
    url: "test-url",
    media_type: "image/*",
    visualization_order: 0,
  },
};

describe("NovaImagePreview", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaImagePreview, { props });

    expect(wrapper).toBeTruthy();

    const buttons = wrapper.findAll(selectors.button);
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toBe("Change");
    expect(buttons[1].text()).toBe("Remove");

    expect(wrapper.find(selectors.filename).text()).toBe(props.image.name);
    expect(wrapper.find(selectors.image).exists()).toBe(true);
    expect(wrapper.find(selectors.image).attributes().src).toBe("test-url");
  });

  describe("when the user clicks on the remove button", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImagePreview, { props });

      const buttons = wrapper.findAll(selectors.button);
      await buttons[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["click:delete"];
      expect(events).toBeTruthy();
    });
  });

  describe("when the user clicks on the edit button", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaImagePreview, { props });

      const buttons = wrapper.findAll(selectors.button);
      await buttons[0].trigger("click");

      const events = wrapper.emitted<Event[]>()["click:edit"];
      expect(events).toBeTruthy();
    });
  });
});
