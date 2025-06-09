import { describe, test, expect, vi } from "vitest";
import { mount, config, shallowMount } from "@vue/test-utils";
import { isoDuration } from "@musement/iso-duration";
import { testId } from "@/utils/test.utils";
import FieldCancellationPolicies, { Props } from "../FieldCancellationPolicies.vue";

const props: Props = {
  modelValue: [
    {
      id: "refund-policy-1",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      period: "P5D",
      refund_type_code: "PERCENTAGE",
      value: 100,
      action: "CREATE",
    },
    {
      id: "refund-policy-2",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      period: "P2D",
      refund_type_code: "PERCENTAGE",
      value: 80,
      action: "DELETE",
    },
    {
      id: "refund-policy-3",
      experience: "cd6cde4f-0ac5-49a3-ba81-f686935d7850",
      period: "P1D",
      refund_type_code: "PERCENTAGE",
      value: 50,
      action: "EDIT",
    },
    {
      id: "refund-policy-4",
      experience: "cd6cGe4f-6ac5-49a3-ba82-f686935d7850",
      period: "P6D",
      refund_type_code: "PERCENTAGE",
      value: 50,
      action: "NOOP",
    },
  ],
  experienceId: "exp-id",
};

const selectors = {
  notRefundableRadio: testId("input-radio-NON_REFUNDABLE"),
  addBtn: testId("cancellation-policies-add"),
  editBtn: testId("cancellation-policies-edit"),
  itemDeleteBtn: testId("cancelletion-policy-item-delete"),
  deleteModalConfirm: testId("modal-save-btn"),
};

config.global.mocks = {
  $t: (text: string) => text,
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
    $isoDuration: isoDuration,
  }),
}));

vi.mock("@musement/iso-duration", () => ({
  isoDuration: () => ({
    humanize: (text: string) => text,
    parse: () => ({
      days: 3,
    }),
  }),
}));

config.global.stubs = {
  UtilsRenderHtml: {
    template: "<span></span>",
  },
};

describe("FieldCancellationPolicies", () => {
  test("it renders correctly when refundable is true and policies are empty", () => {
    const wrapper = mount(FieldCancellationPolicies, { props: { ...props, modelValue: [] } });

    expect(wrapper.findComponent({ name: "NovaInputRadioGroup" }).props("modelValue")).toBe("NON_REFUNDABLE");
    expect(wrapper.find(".CancellationPolicies__empty-text").exists()).toBe(false);
    expect(wrapper.find(".CancellationPolicies__filled-text").exists()).toBe(false);
    expect(wrapper.findComponent({ name: "CancellationPoliciesItem" }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: "NovaButton" }).exists()).toBe(false);
  });

  test("it renders correctly when refundable is true and policies are not empty", () => {
    const wrapper = mount(FieldCancellationPolicies, { props });

    expect(wrapper.findComponent({ name: "NovaInputRadioGroup" }).props("modelValue")).toBe("REFUNDABLE");
    expect(wrapper.find(".CancellationPolicies__empty-text").exists()).toBe(false);
    expect(wrapper.find(".CancellationPolicies__filled-text").exists()).toBe(true);
  });

  test("it opens the modal when add button is clicked", () => {
    const wrapper = mount(FieldCancellationPolicies, { props });

    wrapper.find(selectors.addBtn).trigger("click");

    expect(wrapper.findComponent({ name: "CancellationPoliciesModal" }).isVisible()).toBe(true);
  });

  test("it opens the modal when edit button is clicked", () => {
    const wrapper = mount(FieldCancellationPolicies, { props });

    expect(wrapper.find(selectors.editBtn).exists()).toBe(true);
    wrapper.find(selectors.editBtn).trigger("click");

    expect(wrapper.findComponent({ name: "CancellationPoliciesModal" }).isVisible()).toBe(true);
  });

  test("it deletes the policy when confirm delete button is clicked", async () => {
    const wrapper = mount(FieldCancellationPolicies, { props });

    await wrapper.findAll(selectors.itemDeleteBtn)[0].trigger("click");
    await wrapper.find(selectors.deleteModalConfirm).trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0][0]).toStrictEqual([
      props.modelValue[1],
      props.modelValue[2],
      props.modelValue[3],
    ]);

    await wrapper.findAll(selectors.itemDeleteBtn)[1].trigger("click");
    await wrapper.find(selectors.deleteModalConfirm).trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[1][0]).toStrictEqual(props.modelValue);
  });

  test("it deletes all policies when the exp is set to not refundable", async () => {
    const wrapper = mount(FieldCancellationPolicies, { props });

    await wrapper.find(selectors.notRefundableRadio).trigger("change");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0][0]).toStrictEqual(
      props.modelValue.map((p) => ({ ...p, action: "DELETE" }))
    );
  });

  describe("if is readonly", () => {
    test("if is not refundable (empty model value), it should show the readonly radio group component", () => {
      const wrapper = shallowMount(FieldCancellationPolicies, { props: { ...props, modelValue: [], readonly: true } });
      expect(wrapper.findComponent({ name: "NovaInputRadioGroup" }).props("modelValue")).toBe("NON_REFUNDABLE");
      expect(wrapper.findComponent({ name: "NovaInputRadioGroup" }).attributes("readonly")).toBe("");
    });

    test("if is refundable (model value > 0), it should show the cancellation policies", () => {
      const wrapper = mount(FieldCancellationPolicies, { props: { ...props, readonly: true } });
      expect(wrapper.findComponent({ name: "NovaInputRadioGroup" }).props("modelValue")).toBe("REFUNDABLE");
      expect(wrapper.findAllComponents({ name: "CancellationPoliciesItem" }).length).toBe(2);
    });
  });
});
