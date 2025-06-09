import { shallowMount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import NovaAlert from "./NovaAlert.vue";

describe("NovaAlert", () => {
  test("it should render correctly", () => {
    const wrapper = shallowMount(NovaAlert, {
      props: { status: "success" },
      slots: { default: "alert text slot" },
    });
    const alert = wrapper.find("div[data-testid='nova-alert']");

    expect(wrapper.html()).toContain("alert text slot");
    expect(alert.attributes().status).toBe("success");

    expect(wrapper.find("nova-icon-stub").attributes().name).toBe("success-solid");

    // check the default props
    expect(alert.attributes().size).toBe("sm");
    expect(alert.attributes().variant).toBe("solid");
  });

  describe("if the props 'status' or 'size' changes", () => {
    test("it should show the right icon and class or size", async () => {
      const wrapper = shallowMount(NovaAlert, {
        props: { status: "info" },
      });
      const alert = wrapper.find("div[data-testid='nova-alert']");

      expect(alert.attributes().status).toBe("info");
      expect(wrapper.find("nova-icon-stub").attributes().name).toBe("info-solid");

      await wrapper.setProps({ status: "error", size: "md" });
      expect(alert.attributes().status).toBe("error");
      expect(alert.attributes().size).toBe("md");

      expect(wrapper.find("nova-icon-stub").attributes().name).toBe("error-solid");

      await wrapper.setProps({
        status: "warning",
        size: "lg",
        variant: "left-accent",
      });
      expect(alert.attributes().status).toBe("warning");
      expect(alert.attributes().size).toBe("lg");
      // check the variant prop
      expect(alert.attributes().variant).toBe("left-accent");

      expect(wrapper.find("nova-icon-stub").attributes().name).toBe("warning-solid");
    });
  });
});
