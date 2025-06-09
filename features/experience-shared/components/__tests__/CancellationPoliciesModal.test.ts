import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import { isoDuration } from "@musement/iso-duration";
import { testId } from "@/utils/test.utils";
import CancellationPoliciesModal, { Props } from "../CancellationPoliciesModal.vue";
import { ManageableRefundPolicy } from "../../stores/useRefundPoliciesStore";

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
  ],
  show: true,
  experienceId: "exp-id",
};

const selectors = {
  deleteBtn: testId("cancelletion-policy-item-delete"),
  saveBtn: testId("policies-modal-save-btn"),
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

describe("CancellationPoliciesModal", () => {
  test("it renders correctly when show is true", () => {
    const wrapper = mount(CancellationPoliciesModal, { props });

    expect(wrapper.findComponent({ name: "NovaModal" }).props("show")).toBe(true);
    expect(wrapper.find(".CancellationPoliciesModal").exists()).toBe(true);
  });

  test("it emits close:modal event when close button is clicked", () => {
    const wrapper = mount(CancellationPoliciesModal, { props });

    wrapper.findComponent({ name: "NovaButtonIcon" }).trigger("click");
    expect(wrapper.emitted("close:modal")).toBeTruthy();
  });

  test("it adds a cancellation policy when add button is clicked", () => {
    const wrapper = mount(CancellationPoliciesModal, {
      props: {
        ...props,
        modelValue: [],
      },
    });

    const addButton = wrapper.findComponent({ name: "NovaButton" });
    addButton.trigger("click");

    const policies = (wrapper.vm as any).policies as ManageableRefundPolicy[];

    expect(policies.length).toBe(1);
    expect(policies[0].experience).toBe("exp-id");
    expect(policies[0].refund_type_code).toBe("PERCENTAGE");
    expect(policies[0].period).toBe("P3D");
    expect(policies[0].value).toBe(100);
    expect(policies[0].action).toBe("CREATE");
  });

  test("it handles policy deletion correctly", () => {
    const wrapper = mount(CancellationPoliciesModal, { props });

    wrapper.findAll(selectors.deleteBtn)[0].trigger("click");

    const policies = (wrapper.vm as any).policies as ManageableRefundPolicy[];
    expect(policies.length).toBe(2);

    wrapper.findAll(selectors.deleteBtn)[1].trigger("click");
    expect(policies.length).toBe(2);
    expect(policies[1].action).toBe("DELETE");
  });

  test("it emits update:modelValue and close:modal events when save button is clicked", () => {
    const wrapper = mount(CancellationPoliciesModal, { props });

    wrapper.find(selectors.saveBtn).trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual(props.modelValue);
    expect(wrapper.emitted("close:modal")).toBeTruthy();
  });
});
