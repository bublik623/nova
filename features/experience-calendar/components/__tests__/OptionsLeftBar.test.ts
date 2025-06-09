import { config, mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { useOptionValidation } from "../../composables/useOptionValidation";
import OptionsLeftBar, { Props } from "../OptionsLeftBar.vue";
import DocumentSidebar from "@/components/Document/DocumentSidebar/DocumentSidebar.vue";
import DocumentSidebarSection from "@/components/Document/SidebarSection/SidebarSection.vue";
import { usePickupsStore } from "../../store/usePickupsStore";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

config.global.mocks = {
  $t: (text: string) => text,
};

config.global.stubs = {
  NuxtLink: RouterLinkStub,
};

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $t: (text: string) => text,
  }),
}));

const mockRoute = {
  params: {
    id: "test-id",
    optionId: "option-id",
    flow: "raw",
  },
};

vi.stubGlobal("useRoute", () => mockRoute);

const mockRouter = {};

vi.stubGlobal("useRouter", () => mockRouter);

const baseProps: Props = {
  id: "test-id",
  optionId: "option-id",
  flow: "raw",
  optionName: "Test ID",
  experienceName: "Experience title",
  selectedView: "all",
  experienceType: ExperienceType.NO_CALENDAR_FIXED_END,
  displayPickupPage: true,
  validation: {
    availability: true,
    pricing: true,
    optionSettings: {
      fieldIsValid: { value: () => true },
    } as unknown as ReturnType<typeof useOptionValidation>,
    customerDetails: true,
    pickups: {
      hasPickupService: true,
      fields: {
        selectedPickups: {
          value: [],
          category: "",
        },
        contactEmail: {
          value: "",
          category: "",
        },
        contactPhoneNumber: {
          value: {
            phone_number: "",
            country_iso_code: "",
            phone_prefix: "",
          },
          category: "",
        },
      },
    } as unknown as ReturnType<typeof usePickupsStore>,
  },
};

describe("OptionsLeftBar", () => {
  test("it renders correctly", () => {
    const wrapper = mount(OptionsLeftBar, { props: baseProps });

    expect(wrapper).toBeTruthy();

    expect(wrapper.find(".DocumentSidebar__option-name").text()).toBe("Test ID");

    expect(wrapper.find("[data-testid='options-experience-title'").text()).toBe(baseProps.experienceName);
  });

  test("in curation flow, it renders the correct fields based on the view type", async () => {
    const wrapper = mount(OptionsLeftBar, {
      props: baseProps,
      global: { components: [DocumentSidebar, DocumentSidebarSection] },
    });

    const listItem = () => wrapper.findAll('[data-testid="sidebar-section-title"]');

    const subListItem = () => wrapper.findAll("[data-testid^=sidebar-section-item]");

    expect(listItem().length).toBe(5);
    expect(subListItem().length).toBe(0);

    await listItem()[0].trigger("click");
    expect(subListItem().length).toBe(4);

    await wrapper.setProps({
      flow: "curation",
      selectedView: "commercial",
    });

    // the first item dropdown is open already now
    expect(listItem().length).toBe(1);
    expect(subListItem().length).toBe(1);
  });

  describe("if the experience type is not open", () => {
    test("it should show the pricing definition field", async () => {
      const wrapper = mount(OptionsLeftBar, {
        props: { ...baseProps, experienceType: ExperienceType.CALENDAR_NO_TIMESLOTS },
        global: { components: [DocumentSidebar, DocumentSidebarSection] },
      });

      const listItem = () => wrapper.findAll('[data-testid="sidebar-section-title"]');
      const subListItem = () => wrapper.findAll("[data-testid^=sidebar-section-item]");

      expect(subListItem().length).toBe(0);
      await listItem()[0].trigger("click");
      expect(wrapper.find('[data-testid="sidebar-section-item-option.pricing-definition"]').isVisible()).toBeTruthy();
      expect(subListItem().length).toBe(5);
    });
  });

  test('it should not display the "Pickups" section if the displayPickupPage prop is false', () => {
    const wrapper = mount(OptionsLeftBar, {
      props: { ...baseProps, displayPickupPage: false },
      global: { components: [DocumentSidebar, DocumentSidebarSection] },
    });

    const listItem = () => wrapper.findAll('[data-testid="sidebar-section-title"]');
    const subListItem = () => wrapper.findAll("[data-testid^=sidebar-section-item]");

    expect(listItem().length).toBe(4);
    expect(subListItem().length).toBe(0);
  });
});
