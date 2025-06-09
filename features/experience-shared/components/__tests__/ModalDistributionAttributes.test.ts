import { describe, test, expect, vi } from "vitest";
import { mount, VueWrapper, config } from "@vue/test-utils";
import NovaModal from "@/ui-kit/NovaModal/NovaModal.vue";
import ModalDistributionAttributes from "@/features/experience-shared/components/ModalDistributionAttributes.vue";
import { testId } from "@/utils/test.utils";

config.global.mocks = { $t: (text: string) => text };
vi.stubGlobal("useNuxtApp", () => ({ $t: (s: string) => s }));

const mockedUseDistributionAttributes = {
  curationOptions: [{ label: "Dedicated", value: "DEDICATED" }],
  priorityOptions: [{ label: "Priority 8", value: "8" }],
  attributeValues: { value: { curationLevel: "DEDICATED", priority: 1 } },
};

vi.mock("@/features/experience-shared/composables/useDistributionAttributes.ts", () => ({
  useDistributionAttributes: () => mockedUseDistributionAttributes,
}));

describe("ModalDistributionAttribute.vue", () => {
  let wrapper: VueWrapper;
  const render = () => {
    wrapper = mount(ModalDistributionAttributes, {});
  };

  test("should render the modal", async () => {
    render();

    const title = wrapper.find(".ModalDistributionAttributes__title");
    const description = wrapper.find(".ModalDistributionAttributes__description");

    expect(title.text()).toBe("experience.modal.attributes.title");
    expect(description.text()).toBe("experience.modal.attributes.description");
    expect(wrapper.findAllComponents(NovaModal)).toBeTruthy();
    const buttons = wrapper.findAllComponents({ name: "NovaButton" });
    expect(buttons[0].text()).toBe("common.cancel");
    expect(buttons[1].text()).toBe("common.submit");
  });

  test("cancel event should be emitted when cancel button is clicked", async () => {
    render();

    const findCancelButton = () => wrapper.find(testId("modal-distribution-cancel"));
    expect(findCancelButton().exists()).toBeTruthy();
    await findCancelButton().trigger("click");

    const events = wrapper.emitted<Event[]>()["cancel"];
    expect(events.length).toBeTruthy();
  });

  test("confirm event should be emitted when submit button is clicked", async () => {
    render();

    const findSubmitButton = () => wrapper.find(testId("modal-distribution-submit"));
    expect(findSubmitButton().exists()).toBeTruthy();
    await findSubmitButton().trigger("click");

    const events = wrapper.emitted<Event[]>()["confirm"];
    expect(events.length).toBe(1);
  });

  test("submit button should be disabled when a curation level is not selected", async () => {
    mockedUseDistributionAttributes.attributeValues.value.priority = 1;
    mockedUseDistributionAttributes.attributeValues.value.curationLevel = "";

    render();

    const findSubmitButton = () => wrapper.find(testId("modal-distribution-submit"));
    expect(findSubmitButton().attributes("disabled")).toBe("");
  });

  test("submit button should be disabled when a priority is not selected", async () => {
    // @ts-expect-error priority is a number
    mockedUseDistributionAttributes.attributeValues.value.priority = undefined;
    mockedUseDistributionAttributes.attributeValues.value.curationLevel = "DEDICATED";

    render();

    const findSubmitButton = () => wrapper.find(testId("modal-distribution-submit"));
    expect(findSubmitButton().attributes("disabled")).toBe("");
  });
});
