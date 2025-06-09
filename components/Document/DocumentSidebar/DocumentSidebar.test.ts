import { mount, config, RouterLinkStub } from "@vue/test-utils";

import { describe, test, expect, vi } from "vitest";
import DocumentSidebar, { Props } from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

const mockRoute = {
  path: "/experience/12345/raw/settings",
  fullPath: "/experience/12345/raw/settings",
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

const selector = {
  wrapper: "[data-testid='sidebar-wrapper']",
  sections: "[data-testid='sidebar-section-button']",
  buttonCollapse: "[data-testid='sidebar-btn-collapse']",
  closedSidebar: "[data-testid='sidebar-closed']",
  items: "button.SidebarSection__list-item",
  searchbar: "[data-testid='list-search-input-text']",
  sectionList: "[data-testid='sidebar-section-list']",
  buttonIcon: "[data-testid='nova-button-icon']",
  circleCategory: "[data-testid='sidebar-section-circle-category']",
};
const findSection = (category: string) => `[data-testid='sidebar-section-wrapper-${category}']`;

const props: Props = {
  showInputText: true,
  sidebarCategories: {
    settings: {
      id: "settings",
      url: "/experience/12345/raw/settings",
      disabled: false,
      fields: [
        {
          id: "asterix_id",
          required: true,
          filled: true,
          title: "Asterix or Core ID",
        },
        {
          id: "option",
          required: true,
          filled: true,
          title: "Option",
        },
        {
          id: "title",
          required: true,
          filled: true,
          title: "Title",
        },
        {
          id: "categories",
          required: false,
          filled: false,
          title: "Experience category",
        },
        {
          id: "promotional_options",
          required: false,
          filled: false,
          title: "Promotional options",
        },
        {
          id: "product_brand",
          required: false,
          filled: false,
          title: "Product brand",
        },
        {
          id: "own_offer",
          required: true,
          filled: true,
          title: "Own offer classification",
        },
      ],
      required: true,
      completed: true,
      icon: "settings",
      dropdown: true,
    },
    location: {
      id: "location",
      url: "/experience/12345/raw/location",
      disabled: false,
      fields: [
        {
          id: "location.city",
          required: true,
          filled: true,
          title: "City",
        },
      ],
      required: true,
      completed: true,
      icon: "location",
      dropdown: true,
    },
    content_generation: {
      id: "content_generation",
      url: "/experience/12345/raw/content-generation",
      disabled: false,
      fields: [
        {
          id: "description",
          required: true,
          filled: false,
          title: "Description",
        },
        {
          id: "additional_description",
          required: false,
          filled: false,
          title: "Additional description",
        },
        {
          id: "features",
          required: false,
          filled: true,
          title: "Features",
        },
        {
          id: "highlights",
          required: true,
          filled: true,
          title: "Highlights",
        },
        {
          id: "included",
          required: true,
          filled: true,
          title: "What's included",
        },
        {
          id: "non_included",
          required: false,
          filled: false,
          title: "What's excluded",
        },
        {
          id: "important_information",
          required: false,
          filled: false,
          title: "Important to know",
        },
      ],
      required: true,
      completed: false,
      icon: "content-generator",
      dropdown: true,
    },
    customer_information: {
      id: "customer_information",
      url: "/experience/12345/raw/customer-info",
      disabled: false,
      fields: [
        {
          id: "emergency_contact",
          required: false,
          filled: false,
          title: "Emergency contact",
        },
        {
          id: "voucher_type",
          required: true,
          filled: true,
          title: "Voucher type",
        },
        {
          id: "info_voucher",
          required: false,
          filled: false,
          title: "Voucher instructions",
        },
      ],
      required: true,
      completed: true,
      icon: "customer-info",
      dropdown: true,
    },
    pricing_and_availability: {
      id: "pricing_and_availability",
      url: "/experience/12345/raw/pricing-and-availability",
      disabled: false,
      fields: [
        {
          id: "pricing.experience-type",
          required: false,
          filled: true,
          title: "Experience type",
        },
        {
          id: "pricing.currency",
          required: true,
          filled: true,
          title: "Currency",
        },
        {
          id: "pricing.instant-confirmation",
          required: false,
          filled: true,
          title: "Instant confirmation",
        },
        {
          id: "pricing.cutoff-time",
          required: false,
          filled: true,
          title: "Cutoff time",
        },
      ],
      required: true,
      completed: true,
      icon: "ticket",
      dropdown: true,
    },
    segmentation_details: {
      id: "segmentation_details",
      url: "/experience/12345/raw/segmentation-details",
      disabled: false,
      fields: [
        {
          id: "duration",
          required: true,
          filled: false,
          title: "Duration",
        },
      ],
      required: true,
      completed: false,
      icon: "additional-services",
      dropdown: true,
    },
    options: {
      id: "options",
      url: "/experience/12345/raw/options",
      disabled: false,
      fields: [
        {
          id: "options",
          required: true,
          filled: false,
          title: "experience.options.title",
        },
      ],
      required: true,
      completed: false,
      icon: "options",
      disabledBy: "pricing_and_availability",
      dropdown: false,
    },
    agenda: {
      id: "agenda",
      url: "/experience/12345/raw/agenda",
      disabled: true,
      fields: [
        {
          id: "agenda",
          required: false,
          filled: false,
          title: "Agenda",
        },
      ],
      required: false,
      completed: false,
      icon: "calendar",
      disabledBy: "options",
      dropdown: false,
    },
  },
};

describe("DocumentSidebar", () => {
  test("it should render correctly", () => {
    const wrapper = mount(DocumentSidebar, { props });

    expect(wrapper.find(selector.wrapper).exists()).toBeTruthy();
  });

  describe("it the user press the button at the bottom", () => {
    test("it should close the sidebar", async () => {
      const wrapper = mount(DocumentSidebar, { props });
      expect(wrapper.find(selector.sections).exists()).toBeTruthy();
      expect(wrapper.find(selector.sections).isVisible()).toBeTruthy();
      await wrapper.find(selector.buttonCollapse).trigger("click");
      expect(wrapper.find(selector.sections).exists()).toBeFalsy();
      await wrapper.find(selector.buttonCollapse).trigger("click");
      expect(wrapper.find(selector.sections).exists()).toBeTruthy();
      expect(wrapper.find(selector.sections).isVisible()).toBeTruthy();
    });
  });
  describe("when the user searches for a field", () => {
    test("the fields get filtered correctly by the search bar", async () => {
      const wrapper = mount(DocumentSidebar, { props });

      await wrapper.find(selector.searchbar).setValue("a");
      expect(wrapper.findAll(selector.sectionList).length).toBe(6);
      expect(wrapper.findAll(selector.items).length).toBe(11);
      expect(wrapper.findAll(selector.items)[0].text()).toContain("experience.asterix_id.title");

      // check if the sections are open
      expect(wrapper.find(findSection("settings")).attributes().open).toBe("true");
      expect(wrapper.find(findSection("content_generation")).attributes().open).toBe("true");

      await wrapper.find(selector.searchbar).setValue("");

      // the fist one should be open because we are in his route
      expect(wrapper.find(findSection("settings")).attributes().open).toBe("true");
      expect(wrapper.find(findSection("content_generation")).attributes().open).toBe(undefined);

      expect(wrapper.findAll(selector.sectionList).length).toBe(1);
      expect(wrapper.findAll(selector.items).length).toBe(7);
    });
  });

  describe("closed DocumentSidebar", () => {
    describe("if the user click on an icon button", () => {
      test("it should be redirected to his category url", async () => {
        const wrapper = mount(DocumentSidebar, { props });
        await wrapper.find(selector.buttonCollapse).trigger("click");

        await wrapper.findAll(selector.buttonIcon)[5].trigger("click");

        expect(mockRouter.push).toBeCalledWith("/experience/12345/raw/pricing-and-availability");
      });
    });
    describe("if the user click on the search icon", () => {
      test("it should open the sidebar", async () => {
        const wrapper = mount(DocumentSidebar, { props });
        await wrapper.find(selector.buttonCollapse).trigger("click");

        await wrapper.findAll(selector.buttonIcon)[0].trigger("click");

        expect(wrapper.find(selector.sections).exists()).toBeTruthy();
        expect(wrapper.find(selector.sections).isVisible()).toBeTruthy();
      });
    });
  });
});
