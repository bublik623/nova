import { config, mount, MountingOptions, VueWrapper } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import CustomerDetailsForm, { CustomerDetailsFormProps } from "../CustomerDetailsForm.vue";
import { testId } from "@/utils/test.utils";
import { BookingQuestion } from "@/types/generated/QuestionMasterDataServiceApi";

const questions: Partial<BookingQuestion>[] = [
  {
    id: "1",
    code: "firstname",
    question: "First name",
    description: "eg john",
    category: "MAIN",
    apply_policy: "PARTICIPANT",
  },
  {
    id: "2",
    code: "lastname",
    question: "Last name",
    description: "eg doe",
    category: "MAIN",
    apply_policy: "PARTICIPANT",
  },
  {
    id: "3",
    code: "EMAIL",
    question: "Email adress",
    description: "Please enter your email address",
    category: "MAIN",
    apply_policy: "CONFIGURABLE",
  },
  {
    id: "4",
    code: "DOB",
    question: "Date of birth",
    description: "Please enter your date of birth",
    category: "PERSONAL",
    apply_policy: "BOOKING",
  },
];

config.global.mocks = {
  $t: (text: string) => text,
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

describe("CustomerDetailsForm", () => {
  let wrapper: VueWrapper<InstanceType<typeof CustomerDetailsForm>>;

  const render = (options: MountingOptions<CustomerDetailsFormProps> = {}) => {
    wrapper = mount(CustomerDetailsForm, {
      props: {
        questions,
      },
      ...options,
    });
  };

  test("renders the form", () => {
    render();

    expect(wrapper.html()).toContain("First name");
    expect(wrapper.html()).toContain("Last name");
    expect(wrapper.html()).toContain("Email adress");
    expect(wrapper.html()).toContain("Date of birth");
  });

  describe("Tabs", () => {
    test("displays all questions by default", () => {
      render();

      expect(wrapper.findAll(testId("question"))).toHaveLength(questions.length);
    });

    test("displays only selected questions when selected tab is clicked", async () => {
      render();

      await wrapper.find(testId("tab-selected")).trigger("click");
      expect(wrapper.findAll(testId("question"))).toHaveLength(2);
    });
  });

  test("emits form data when the form is updated", async () => {
    render();

    const questionToggle = wrapper.find(testId("question-ask-for-all"));
    await questionToggle.trigger("click");

    expect(wrapper.emitted("update")).toBeTruthy();
  });

  test("shows the toggle only if the question is configurable", () => {
    render();

    const questionToggles = wrapper.findAll(testId("question-ask-for-all"));
    expect(questionToggles.length).toBe(3);
  });

  test("if is readonly it should not be editable", () => {
    render({ props: { questions, readonly: true } });

    const questionToggle = wrapper.find(testId("question-ask-for-all"));
    expect(questionToggle.attributes("disabled")).toBe("");
  });
});
