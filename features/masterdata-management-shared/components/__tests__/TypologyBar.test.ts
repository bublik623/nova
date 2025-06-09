import { config, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import TypologyBar, { Props } from "@/features/masterdata-management-shared/components/TypologyBar.vue";
import { testId, startsWithTestId } from "@/utils/test.utils";

vi.mock("@/features/roles/lib/has-permission", () => ({
  hasPermission: vi.fn(),
}));
import { hasPermission } from "@/features/roles/lib/has-permission";

const props: Props = {
  title: "this is the title",
  categories: "this is the category",
  missingTranslations: "this is the missing translation",
  searchQuery: "",
};

config.global.mocks = {
  $t: (s: string) => s,
  useDetectClickOutside: vi.fn(),
};

describe("TypologyBar", () => {
  beforeEach(() => {
    (hasPermission as Mock).mockReset();
  });

  test("it should mount correctly", () => {
    (hasPermission as Mock).mockReturnValue(true);
    const wrapper = mount(TypologyBar, { props });

    expect(wrapper.text()).includes(props.title);
    expect(wrapper.text()).includes(props.categories);
    expect(wrapper.text()).includes(props.missingTranslations);
    expect(wrapper.find(testId("typology-bar-add-new-button")).exists()).toBeTruthy();
    expect(wrapper.exists()).toBeTruthy();
  });

  test("it should not show the 'add new' button when the user has no permission", () => {
    (hasPermission as Mock).mockReturnValue(false);
    const wrapper = mount(TypologyBar, { props });

    expect(wrapper.find(testId("typology-bar-add-new-button")).exists()).toBeFalsy();
    expect(wrapper.exists()).toBeTruthy();
  });

  describe("if the user click on the add new item button", () => {
    test("it should emit the event", async () => {
      (hasPermission as Mock).mockReturnValue(true);
      const wrapper = mount(TypologyBar, { props: { ...props } });
      expect(wrapper.find(testId("typology-bar-add-new-button")).exists()).toBeTruthy();

      await wrapper.find(testId("typology-bar-add-new-button")).trigger("click");
      await wrapper.findAll(startsWithTestId("options-list-list-item")).at(0)?.trigger("click");

      const events = wrapper.emitted<Event[]>()["click:addBtn"];
      expect(events[0]).toBeTruthy();
    });
  });

  describe("if the user click on the add new category button", () => {
    test("it should emit the event", async () => {
      (hasPermission as Mock).mockReturnValue(true);
      const wrapper = mount(TypologyBar, { props: { ...props } });
      expect(wrapper.find(testId("typology-bar-add-new-button")).exists()).toBeTruthy();

      await wrapper.find(testId("typology-bar-add-new-button")).trigger("click");
      await wrapper.findAll(startsWithTestId("options-list-list-item")).at(1)?.trigger("click");

      const events = wrapper.emitted<Event[]>()["click:createCategory"];
      expect(events[0]).toBeTruthy();
    });
  });

  describe("if the user type something in the searchbar", () => {
    test("it should emit the event", async () => {
      (hasPermission as Mock).mockReturnValue(true);
      const wrapper = mount(TypologyBar, { props: { ...props } });

      await wrapper.find(testId("this-is-the-title-input-text")).setValue("new value");

      const events = wrapper.emitted<Event[]>()["update:searchQuery"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual("new value");
    });
  });
});
