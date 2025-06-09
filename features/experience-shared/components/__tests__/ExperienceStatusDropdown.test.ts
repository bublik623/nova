import { describe, test, expect, vi } from "vitest";
import { mount, MountingOptions, VueWrapper } from "@vue/test-utils";
import { testId } from "@/utils/test.utils";
import ExperienceStatusDropdown, {
  ExperienceStatusDropdownProps,
} from "@/features/experience-shared/components/ExperienceStatusDropdown.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

describe("ExperienceStatusDropdown.vue", () => {
  let wrapper: VueWrapper<InstanceType<typeof ExperienceStatusDropdown>>;
  const render = (options: MountingOptions<ExperienceStatusDropdownProps> = {}) => {
    wrapper = mount(ExperienceStatusDropdown, {
      ...options,
    });
  };
  const findToggle = () => wrapper.find(testId("status-dropdown-toggle"));
  const findActionPublish = () => wrapper.find(testId("status-action-publish"));
  const findActionUnpublish = () => wrapper.find(testId("status-action-unpublish"));
  const findSpinner = () => wrapper.find(testId("nova-spinner"));

  test('shows "Publish" option when distribution is "unpublished" and curation is "READY"', async () => {
    render({ props: { experienceStatus: { distribution: "unpublished", curation: "READY" } } });
    await findToggle().trigger("click");
    expect(findActionPublish().exists()).toBe(true);
    expect(findActionUnpublish().exists()).toBe(false);
  });

  test('shows "Unpublish" option when distribution status is "ready"', async () => {
    render({ props: { experienceStatus: { distribution: "ready" } } });
    await findToggle().trigger("click");
    expect(findActionUnpublish().exists()).toBe(true);
  });

  test('does not show "Publish" option when distribution status is not "unpublished"', async () => {
    render({ props: { experienceStatus: { distribution: "ready" } } });
    await findToggle().trigger("click");
    expect(findActionPublish().exists()).toBe(false);
  });

  describe("Button disabled logic", () => {
    test("button is disabled and chevron icons are not rendered when readonly is true", () => {
      render({ props: { experienceStatus: { distribution: "ready" }, readonly: true } });

      const button = wrapper.find('[data-testid="status-dropdown-toggle"]');
      expect(button.exists()).toBe(true);
      expect(button.attributes("disabled")).toBeDefined();

      const chevronUpIcon = wrapper.find('[data-testid="chevron-up-icon"]');
      const chevronDownIcon = wrapper.find('[data-testid="chevron-down-icon"]');
      expect(chevronUpIcon.exists()).toBe(false);
      expect(chevronDownIcon.exists()).toBe(false);
    });

    test('button is disabled when distribution status is "unpublished" and curation status is "IN_REVIEW"', async () => {
      render({ props: { experienceStatus: { distribution: "unpublished", curation: "IN_REVIEW" } } });
      const button = wrapper.find('[data-testid="status-dropdown-toggle"]');
      expect(button.exists()).toBe(true);
      expect(button.attributes("disabled")).toBeDefined();
    });
  });

  describe("loading", () => {
    test("button is enabled and spinner is not visible when loading is false", () => {
      render({ props: { experienceStatus: { distribution: "ready" }, isLoading: false } });

      expect(findToggle().exists()).toBe(true);
      expect(findToggle().attributes("disabled")).toBeUndefined();
      expect(findSpinner().exists()).toBe(false);
    });

    test("button is disabled and spinner is visible when loading is true", () => {
      render({ props: { experienceStatus: { distribution: "ready" }, isLoading: true } });

      expect(findToggle().exists()).toBe(true);
      expect(findToggle().attributes("disabled")).toBeDefined();
      expect(findSpinner().exists()).toBe(true);
    });
  });
});
