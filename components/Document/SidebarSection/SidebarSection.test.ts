import { describe, test, expect, vi } from "vitest";
import { config, mount, RouterLinkStub, shallowMount } from "@vue/test-utils";

import SidebarSection, { Props } from "@/components/Document/SidebarSection/SidebarSection.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

const mockRoute = {
  path: "/experience-url",
  fullPath: "/experience-url",
};
const mockRouter = {
  push: vi.fn(),
};

config.global.mocks = {
  $t: (text: string) => text,
  $route: mockRoute,
  $router: mockRouter,
};
config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

vi.stubGlobal("useRoute", () => mockRoute);
vi.stubGlobal("useRouter", () => mockRouter);

const props: Props = {
  category: {
    id: "category-id",
    disabled: false,
    fields: [
      {
        id: "field-id-1",
        title: "field-title-1",
        required: true,
        filled: false,
        selected: false,
      },
      {
        id: "field-id-2",
        title: "field-title-2",
        required: false,
        filled: false,
        selected: false,
      },
    ],
    completed: false,
    url: "/experience-new-url",
    selected: false,
    dropdown: true,
    required: true,
  },
  open: false,
};
const selector = {
  wrapper: "[data-testid='sidebar-section-wrapper-category-id']",
  list: "[data-testid='sidebar-section-list']",
  button: "[data-testid='sidebar-section-button']",
  title: "[data-testid='sidebar-section-title']",
  items: "button.SidebarSection__list-item",
  circleCategory: "[data-testid='sidebar-section-circle-category']",
  circleItem: "[data-testid='sidebar-section-circle-item']",
  chevron: "[data-testid='sidebar-section-chevron']",
};
describe("SidebarSection", () => {
  test("it should render correctly", () => {
    const wrapper = mount(SidebarSection, { props });

    expect(wrapper.find(selector.button).exists()).toBeTruthy();
    expect(wrapper.find(selector.title).exists()).toBeTruthy();
  });

  describe("if the prop open is true", () => {
    test("the list should be visible", () => {
      const wrapper = mount(SidebarSection, {
        props: { ...props, open: true },
      });

      expect(wrapper.find(selector.list).exists()).toBeTruthy();
      expect(wrapper.findAll(selector.items).length).toBe(2);
    });
  });

  describe("if the user click on the button", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(SidebarSection, {
        props,
      });

      await wrapper.find(selector.button).trigger("click");

      const events = wrapper.emitted<Event[]>()["click:toggle"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });
  });

  describe("if the user click on the title", () => {
    test("it should emit an event only if the section is not opened", async () => {
      const wrapper = mount(SidebarSection, {
        props,
      });

      await wrapper.find(selector.title).trigger("click");

      const events = wrapper.emitted<Event[]>()["click:toggle"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);

      await wrapper.setProps({ ...props, open: true });
      await wrapper.find(selector.title).trigger("click");

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });

    test("The Nuxtlink should have the right url", () => {
      const wrapper = mount(SidebarSection, {
        props,
      });
      expect(wrapper.findComponent(RouterLinkStub).props().to).toContain("/experience-new-url");
    });
  });

  describe("if the category is completed", () => {
    test("it should have the check icon", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: {
          category: { ...props.category, completed: true },
          open: true,
        },
      });

      expect(wrapper.find(selector.circleCategory).html()).include('name="check');

      expect(wrapper.find(selector.circleCategory).attributes().completed).toBeTruthy();
      expect(wrapper.find(selector.circleCategory).attributes().required).toBeTruthy();
    });
  });

  describe("if the section is not required", () => {
    test("it should have the dotted circle icon", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: {
          ...props,
          category: {
            id: "category-id",
            disabled: false,
            fields: props.category.fields,
            completed: false,
            url: "/experience-new-url",
            selected: false,
            dropdown: true,
            required: false,
          },
        },
      });
      expect(wrapper.find(selector.circleCategory).html()).include('name="circle-dotted');

      expect(wrapper.find(selector.circleCategory).attributes().completed).toBeFalsy();
      expect(wrapper.find(selector.circleCategory).attributes().required).toBeFalsy();
    });
  });

  describe("if the prop selected is true", () => {
    test("the section should have the right attribute", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: {
          category: {
            ...props.category,
            selected: true,
          },
          open: true,
        },
      });

      expect(wrapper.find(selector.wrapper).attributes()["category-selected"]).toBe("true");
    });
  });
  describe("if the dropdown prop is false", () => {
    test("the section should not have the dropdown", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: {
          category: { ...props.category, dropdown: false },
          open: false,
        },
      });

      expect(wrapper.find(selector.list).exists()).toBeFalsy();
      expect(wrapper.find(selector.chevron).exists()).toBeFalsy();
    });
  });

  describe("if the section is disabled", () => {
    test("the section should have the right attribute", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: { category: { ...props.category, disabled: true }, open: false },
      });

      expect(wrapper.find(selector.wrapper).attributes()["is-disabled"]).toBe("true");
    });
  });

  describe("check the required item field icon", () => {
    test("item field required", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: { ...props, open: true },
      });

      expect(wrapper.findAll(selector.items)[0].find(".circle").attributes().required).toBe("true");
      expect(wrapper.findAll(selector.items)[0].find(".circle").attributes().completed).toBe(undefined);
      expect(wrapper.findAll(selector.items)[0].find(".circle").attributes().selected).toBe(undefined);
    });

    test("item field non required", () => {
      const wrapper = shallowMount(SidebarSection, {
        props: { ...props, open: true },
      });

      expect(wrapper.findAll(selector.items)[1].find(".circle").attributes().required).toBe(undefined);
      expect(wrapper.findAll(selector.items)[1].find(".circle").attributes().completed).toBe(undefined);
      expect(wrapper.findAll(selector.items)[1].find(".circle").attributes().selected).toBe(undefined);
    });

    test("item field completed", async () => {
      const wrapper = shallowMount(SidebarSection, {
        props: {
          category: {
            ...props.category,
            fields: [
              {
                id: "field-id-1",
                title: "field-title-1",
                required: true,
                filled: true,
                selected: false,
              },
            ],
          },
          open: true,
        },
      });

      const [_chevronIcon, checkIcon] = wrapper.findAllComponents(NovaIcon);

      expect(wrapper.findAll(selector.items)[0].find(".circle").attributes().completed).toBe("true");
      expect(wrapper.findAll(selector.items)[0].find(".circle").attributes().required).toBe("true");

      expect(checkIcon.props().name).toBe("check");
    });

    test("category section completed", async () => {
      const wrapper = shallowMount(SidebarSection, {
        props: {
          category: { ...props.category, completed: true },
          open: true,
        },
      });

      const section = wrapper.find(".circle");
      const [checkIcon] = wrapper.findAllComponents(NovaIcon);

      expect(section.attributes("completed")).toBe("true");
      expect(section.attributes("required")).toBe("true");

      expect(checkIcon.props().name).toBe("check");
    });
  });

  describe("if the user click on an item", () => {
    test("the hash should change", async () => {
      const wrapper = mount(SidebarSection, {
        props: { ...props, open: true },
      });

      await wrapper.findAll(selector.items)[0].trigger("click");
      expect(mockRouter.push).toBeCalledWith("/experience-new-url#field-id-1");
      vi.clearAllMocks();
      await wrapper.findAll(selector.items)[1].trigger("click");
      expect(mockRouter.push).toBeCalledWith("/experience-new-url#field-id-2");
    });
  });
});
