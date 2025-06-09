import { describe, test, expect, vi, beforeEach } from "vitest";
import { config, mount, MountingOptions, VueWrapper } from "@vue/test-utils";
import ModalRepublish from "../ModalRepublish.vue";
import { testId } from "@/utils/test.utils";

config.global.mocks = {
  $t: (text: string) => text,
};

describe("ModalRepublish", () => {
  let wrapper: VueWrapper<InstanceType<typeof ModalRepublish>>;
  const onPublishSpy = vi.fn((closeModal: CallableFunction) => closeModal());
  const onSubmitSpy = vi.fn((closeModal: CallableFunction) => closeModal());

  const render = (options: MountingOptions<{}> = {}) => {
    wrapper = mount(ModalRepublish, {
      props: { onPublish: onPublishSpy, onSubmit: onSubmitSpy },
      ...options,
    });
  };

  beforeEach(() => {
    onPublishSpy.mockClear();
    onSubmitSpy.mockClear();
  });

  const findModal = () => wrapper.find(testId("modal-republish"));
  const findPublishAction = () => wrapper.find(testId("modal-action-publish"));
  const findSubmitAction = () => wrapper.find(testId("modal-action-submit"));

  test("renders the modal properly", async () => {
    render();

    expect(findModal().exists()).toBe(true);
  });

  test("emits the confirm event when the publish button is clicked", async () => {
    render();

    await findPublishAction().trigger("click");

    const events = wrapper.emitted<Event[]>()["confirm"];

    expect(events.length).toBeTruthy();
    expect(onPublishSpy).toHaveBeenCalledOnce();
    expect(onSubmitSpy).not.toHaveBeenCalled();
  });

  test("emits the cancel event when the cancel button is clicked", async () => {
    render();

    await findSubmitAction().trigger("click");

    const events = wrapper.emitted<Event[]>()["confirm"];

    expect(events.length).toBeTruthy();
    expect(onSubmitSpy).toHaveBeenCalledOnce();
    expect(onPublishSpy).not.toHaveBeenCalled();
  });
});
