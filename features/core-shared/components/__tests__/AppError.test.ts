import { mount, config } from "@vue/test-utils";
import { describe, test, expect, vi } from "vitest";
import { AppErrorCause } from "@/types/AppErrorsCause";
import AppError from "../AppError.vue";

config.global.mocks = {
  $t: (s: string) => s,
};

config.global.stubs = {
  NovaIcon: true,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

describe("AppError", () => {
  test("renders correct description for MISSING_PERMISSION error", () => {
    const wrapper = mount(AppError, {
      props: {
        error: { cause: AppErrorCause.MISSING_PERMISSION },
      },
    });
    // Expect the label returned by $t to be visible
    expect(wrapper.text()).toContain("app-error.missing-permissions.description");
  });

  test("renders correct description for JWT_TOKEN error", () => {
    const wrapper = mount(AppError, {
      props: {
        error: { cause: AppErrorCause.JWT_TOKEN },
      },
    });
    expect(wrapper.text()).toContain(
      "There seems to be an issue with authentication service. Please log out and try again."
    );
  });

  test("renders correct description for SSO_PROXY error", () => {
    const wrapper = mount(AppError, {
      props: {
        error: { cause: AppErrorCause.SSO_PROXY },
      },
    });
    expect(wrapper.text()).toContain(
      "SSO_PROXY There seems to be an issue with authentication service. Please log out and try again."
    );
  });

  test("renders default description for an unknown error", () => {
    const wrapper = mount(AppError, {
      props: {
        error: { cause: "UNDEFINED_ERROR" },
      },
    });
    expect(wrapper.text()).toContain("app-error.unknown.description");
  });
});
