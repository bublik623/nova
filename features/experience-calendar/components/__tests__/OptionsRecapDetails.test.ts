import { mount, flushPromises, config } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import OptionsRecapDetails from "../OptionsRecapDetails.vue";

const routerMock = {
  push: vi.fn(),
};

const useCustomerDetailsStoreMock = {
  bookingQuestions: [
    { code: "Q1", category: "CAT1", question: "question 1" },
    { code: "Q2", category: "CAT2", question: "question 2" },
  ],
  fields: {
    questions: {
      value: [{ booking_question_code: "Q1" }, { booking_question_code: "Q2" }],
    },
  },
  loadData: vi.fn(),
};

config.global.mocks = {
  $t: (s: string) => s,
  $router: routerMock,
};

vi.mock("@/features/experience-calendar/store/useCustomerDetailsStore", () => ({
  useCustomerDetailsStore: () => useCustomerDetailsStoreMock,
}));

vi.stubGlobal("useLazyAsyncData", () => {
  return new Promise(() => {});
});

describe("OptionsRecapDetails.vue", () => {
  test("It renders correctly", async () => {
    const wrapper = mount(OptionsRecapDetails, {
      props: {
        optionId: "1",
        experienceId: "2",
        path: "/path/to/details",
      },
    });

    await flushPromises();

    const headerRows = wrapper.findAll(".CustomerDetailsRecapTable thead tr");

    expect(headerRows.length).toBe(1);

    const bodyRows = wrapper.findAll(".CustomerDetailsRecapTable tbody tr");

    expect(bodyRows.length).toBe(2);

    expect(bodyRows[0].text()).toContain("question 1");
    expect(bodyRows[1].text()).toContain("question 2");
  });

  test("navigates on edit button click", async () => {
    const wrapper = mount(OptionsRecapDetails, {
      props: {
        optionId: "1",
        experienceId: "2",
        path: "/path/to/details",
      },
    });

    await flushPromises();

    wrapper.find('[data-testid="customer-details-table-reroute"]').trigger("click");

    expect(routerMock.push).toHaveBeenCalledWith("/path/to/details");
  });

  describe("if is readonly", async () => {
    test("it should show the edit buttons", async () => {
      const wrapper = mount(OptionsRecapDetails, {
        props: {
          optionId: "1",
          experienceId: "2",
          path: "/path/to/details",
          readonly: true,
        },
      });

      expect(wrapper.find('[data-testid="customer-details-table-reroute"]').isVisible()).toBeTruthy();
    });
  });
});
