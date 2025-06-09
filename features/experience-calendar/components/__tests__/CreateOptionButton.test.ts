import { vi, describe, test, expect, beforeEach } from "vitest";
import { mount, config } from "@vue/test-utils";
import createOptionButton, { Props } from "../CreateOptionButton.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

const notificationStoreMock = {
  addNotification: vi.fn(),
};

vi.mock("@/stores/notifications", () => ({
  useNotifications: () => notificationStoreMock,
}));

const mockOfferServiceApi = {
  postOption: vi.fn(() => ({
    data: {
      id: "optionIdPosted",
    },
  })),
};

vi.mock("@/composables/useOfferServiceApi", () => ({
  useOfferServiceApi: () => mockOfferServiceApi,
}));

const customerDetailsStoreMock = { saveForm: vi.fn() };
vi.mock("@/features/experience-calendar/store/useCustomerDetailsStore", () => ({
  useCustomerDetailsStore: () => customerDetailsStoreMock,
}));

const TEST_TITLE = "new option title";

const selectors = {
  button: "[data-testid='experience-options-index-create-option']",
  textInput: "[data-testid='modal-create-option-input-text']",
  createButton: "[data-testid='modal-create-option-create-button']",
  cancelButton: "[data-testid='modal-create-option-cancel-button']",
};

describe("CreateOptionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const props: Props = {
    flow: "raw",
    experienceId: "test-id",
  };

  test("it should render correctly", () => {
    const wrapper = mount(createOptionButton, {
      props,
    });

    expect(wrapper.find(selectors.button).isVisible()).toBe(true);
  });

  test("if you click on the button the modal should appear", async () => {
    const wrapper = mount(createOptionButton, {
      props,
    });

    await wrapper.find(selectors.button).trigger("click");
    expect(wrapper.find(selectors.textInput).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.createButton).isVisible()).toBeTruthy();
    expect(wrapper.find(selectors.cancelButton).isVisible()).toBeTruthy();

    // check if the modal disappear by clicking the "cancel" button
    await wrapper.find(selectors.cancelButton).trigger("click");

    expect(wrapper.find(selectors.textInput).exists()).toBeFalsy();
    expect(wrapper.find(selectors.cancelButton).exists()).toBeFalsy();
    expect(wrapper.find(selectors.createButton).exists()).toBeFalsy();
  });

  test("the 'create' button should be disabled only if the input text is empty", async () => {
    const wrapper = mount(createOptionButton, {
      props,
    });

    await wrapper.find(selectors.button).trigger("click");

    expect(wrapper.find(selectors.textInput).text()).toBe("");
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe("");

    // after filling the text input the button should not be disabled
    await wrapper.find(selectors.textInput).setValue(TEST_TITLE);
    expect(wrapper.find(selectors.createButton).attributes("disabled")).toBe(undefined);
  });

  describe("when the user fills the input text and clicks 'create'", async () => {
    test("it should create a new experience and emit the new route", async () => {
      const wrapper = mount(createOptionButton, {
        props,
      });

      await wrapper.find(selectors.button).trigger("click");
      await wrapper.find(selectors.textInput).setValue(TEST_TITLE);

      await wrapper.find(selectors.createButton).trigger("click");

      await wrapper.vm.$nextTick();

      // check the emit is correct
      // @ts-expect-error ...
      expect(wrapper.emitted()["option:created"][0][0]).toBe("/experience/test-id/options/raw/optionIdPosted");

      expect(mockOfferServiceApi.postOption).toHaveBeenCalledWith("test-id", {
        multilanguage: false,
        capacity_type: "unlimited",
        status: "DRAFT",
        name: TEST_TITLE,
      });
    });

    // OFF-1575
    test("it should save the customer details form", async () => {
      const wrapper = mount(createOptionButton, {
        props,
      });

      await wrapper.find(selectors.button).trigger("click");
      await wrapper.find(selectors.textInput).setValue(TEST_TITLE);

      await wrapper.find(selectors.createButton).trigger("click");

      await wrapper.vm.$nextTick();

      expect(customerDetailsStoreMock.saveForm).toHaveBeenCalledWith("test-id", "optionIdPosted");
    });
  });

  test("if there is an error it should diplay a notification", async () => {
    mockOfferServiceApi.postOption.mockImplementationOnce(() => Promise.reject("Uh oh!"));

    const wrapper = mount(createOptionButton, {
      props,
    });

    await wrapper.find(selectors.button).trigger("click");
    await wrapper.find(selectors.textInput).setValue(TEST_TITLE);

    await wrapper.find(selectors.createButton).trigger("click");

    await wrapper.vm.$nextTick();

    // check the emit is correct
    expect(wrapper.emitted()["option:created"]).toBeUndefined();

    // check the notification
    expect(notificationStoreMock.addNotification).toHaveBeenCalledWith({
      theme: "error",
      message: "experience.option.create.error",
    });
  });
});
