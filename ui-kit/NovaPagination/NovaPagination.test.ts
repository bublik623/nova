import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import NovaPagination from "@/ui-kit/NovaPagination/NovaPagination.vue";

const props = { modelValue: 1, total: 3, itemsPerPage: 1 };

describe("NovaPagination", () => {
  describe("after clicking on Next Page trigger", () => {
    test("it should have set to page 2", async () => {
      const wrapper = mount(NovaPagination, { props });

      await wrapper.find("[data-testid=next-page-button]").trigger("click");
      const events = wrapper.emitted<Event[]>()["update:modelValue"];

      expect(events[0][0]).toEqual(2);
    });
  });

  describe("after clicking on Page 3 trigger", () => {
    test("should have set to page 3", async () => {
      const wrapper = mount(NovaPagination, { props });

      await wrapper.find("[data-testid=page-3]").trigger("click");
      const events = wrapper.emitted<Event[]>()["update:modelValue"];

      expect(events[0][0]).toEqual(3);
    });
  });

  describe("If the props show edges is true", () => {
    test("it should always show page-1 & Page 10", () => {
      const wrapper = mount(NovaPagination, { props: { modelValue: 1, total: 10, itemsPerPage: 1, showEdges: true } });

      expect(wrapper.find('[data-testid="page-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="page-10"]').exists()).toBe(true);
    });

    describe("after clicking on Next Page trigger", () => {
      test("it should have set to page 2", async () => {
        const wrapper = mount(NovaPagination, {
          props: { modelValue: 1, total: 10, itemsPerPage: 1, showEdges: true },
        });

        await wrapper.find("[data-testid=next-page-button]").trigger("click");
        const events = wrapper.emitted<Event[]>()["update:modelValue"];

        expect(events[0][0]).toEqual(2);
      });
    });

    describe("If the current page is the 5th", () => {
      test("it should have default 1 siblings on each side", () => {
        const wrapper = mount(NovaPagination, {
          props: { modelValue: 5, total: 10, itemsPerPage: 1, showEdges: true },
        });

        expect(wrapper.find('[data-testid="page-2"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="page-3"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="page-4"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-5"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-6"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-7"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="page-8"]').exists()).toBe(false);

        // check the ellipsis
        expect(wrapper.findAll('[data-testid="ellipsis"]').length).toBe(2);
      });
    });

    describe("if the sibling props is 2", () => {
      test("it should have 2 sibling for each side", () => {
        const wrapper = mount(NovaPagination, {
          props: { modelValue: 5, total: 10, itemsPerPage: 1, showEdges: true, siblings: 2 },
        });

        expect(wrapper.find('[data-testid="page-2"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="page-3"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-4"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-5"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-6"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-7"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="page-8"]').exists()).toBe(false);

        // check the ellipsis
        expect(wrapper.findAll('[data-testid="ellipsis"]').length).toBe(2);
      });
    });

    describe("if the current page is on the first half of the total count of the pages", () => {
      test("it should show the ellipsis only in one side", () => {
        const wrapper = mount(NovaPagination, {
          props: { modelValue: 1, total: 10, itemsPerPage: 1, showEdges: true, siblings: 1 },
        });

        // check the ellipsis
        expect(wrapper.findAll('[data-testid="ellipsis"]').length).toBe(1);
      });
    });

    describe("if the current page is on the second half of the total count of the pages", () => {
      test("it should show the ellipsis only in one side", () => {
        const wrapper = mount(NovaPagination, {
          props: { modelValue: 10, total: 10, itemsPerPage: 1, showEdges: true, siblings: 1 },
        });

        // check the ellipsis
        expect(wrapper.findAll('[data-testid="ellipsis"]').length).toBe(1);
      });
    });
  });
});
