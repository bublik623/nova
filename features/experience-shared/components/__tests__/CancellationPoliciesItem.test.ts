import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import { isoDuration } from "@musement/iso-duration";
import { testId } from "@/utils/test.utils";
import CancellationPoliciesItem, { Props } from "../CancellationPoliciesItem.vue";

const props: Props = {
  modelValue: {
    id: "refund-policy-1",
    experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
    period: "P5D",
    refund_type_code: "PERCENTAGE",
    value: 100,
    action: "NOOP",
  },
  readonly: false,
};

const selectors = {
  timeInput: testId("cancellation-policies-time-input"),
  select: testId("select-button"),
  amountInput: testId("cancellation-policies-amount-input"),
  deleteBtn: testId("cancelletion-policy-item-delete"),
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
    $isoDuration: isoDuration,
  }),
}));

config.global.mocks = {
  $t: (text: string) => text,
};

describe("CancellationPoliciesItem", () => {
  test("it renders correctly when not readonly", () => {
    const wrapper = mount(CancellationPoliciesItem, { props });

    expect(wrapper.exists()).toBeTruthy();

    expect(wrapper.find(".CancellationPoliciesItem--readonly").exists()).toBe(false);
    expect((wrapper.find(selectors.timeInput).element as HTMLInputElement).value).toBe("5");
    expect((wrapper.find(selectors.amountInput).element as HTMLInputElement).value).toBe("100");
    expect(wrapper.find(selectors.select).text()).toBe("experience.refund_policies.item.days");
  });

  test("it renders correctly when readonly", () => {
    const wrapper = mount(CancellationPoliciesItem, {
      props: { ...props, readonly: true },
    });

    expect(wrapper.find(".CancellationPoliciesItem--readonly").exists()).toBe(true);
  });

  test("it emits update:modelValue event the policy is edited", async () => {
    const wrapper = mount(CancellationPoliciesItem, { props });

    await wrapper.find(selectors.timeInput).setValue(10);
    const events = wrapper.emitted<Event[]>()["update:modelValue"];
    expect(events[0][0]).toStrictEqual({ ...props.modelValue, action: "EDIT", period: "P10D" });
  });

  test("it emits click:delete event when delete button is clicked", () => {
    const wrapper = mount(CancellationPoliciesItem, { props });

    wrapper.find(selectors.deleteBtn).trigger("click");
    const events = wrapper.emitted<Event[]>()["click:delete"];
    expect(events[0][0]).toStrictEqual(props.modelValue);
  });

  test("it should hide the delete button if is readonly", () => {
    const wrapper = mount(CancellationPoliciesItem, { props: { ...props, showDeleteBtn: false } });

    expect(wrapper.find(selectors.deleteBtn).isVisible()).toBeFalsy();
  });
});
