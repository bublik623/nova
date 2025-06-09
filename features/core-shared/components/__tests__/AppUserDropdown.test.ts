import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AppUserDropdown from "../AppUserDropdown.vue";

const logoutMock = vi.fn();

vi.stubGlobal("useNuxtApp", () => ({
  $t: (text: string) => text,
}));

vi.mock("@/features/auth/useAuthStore", () => ({
  useAuthStore: () => ({
    logout: logoutMock,
    userName: "Marco",
    userRoles: ["nova_admin", "invalid_role"],
  }),
}));

vi.mock("@/features/roles/lib/schema", () => ({
  validRoles: {
    safeParse: (role: string) => ({
      success: role === "nova_admin" || role === "nova_readonly",
    }),
  },
}));

describe("AppUserDropdown", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    logoutMock.mockClear();

    wrapper = mount(AppUserDropdown, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
  });

  it("renders the initial letter from userName", () => {
    expect(wrapper.find("button span").text()).toBe("M");
  });

  it("toggles dropdown visibility when button is clicked", async () => {
    const dropdown = wrapper.find('[data-testid="user-dropdown-menu"]');
    expect(dropdown.isVisible()).toBe(false);

    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("click");
    expect(dropdown.isVisible()).toBe(true);

    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("click");
    expect(dropdown.isVisible()).toBe(false);
  });

  it("closes the dropdown when Escape key is pressed", async () => {
    const dropdown = wrapper.find('[data-testid="user-dropdown-menu"]');
    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("click");
    expect(dropdown.isVisible()).toBe(true);

    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("keydown", { key: "Escape" });
    expect(dropdown.isVisible()).toBe(false);
  });

  it("calls logout when the logout button is clicked", async () => {
    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("click");
    const logoutButton = wrapper.find('[data-testid="user-dropdown-item-logout"]');
    await logoutButton.trigger("click");
    expect(logoutMock).toHaveBeenCalled();
  });

  it("displays only valid roles in mappedRoles", async () => {
    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("click");
    const rolesText = wrapper.find('[data-testid="user-dropdown-menu"] ul li:first-child div div.text-text-80').text();
    expect(rolesText).toContain("role-nova_admin");
    expect(rolesText).not.toContain("role-invalid_role");
  });

  it("closes the dropdown when clicking outside", async () => {
    await wrapper.find('[data-testid="user-dropdown-toggle"]').trigger("click");
    const dropdown = wrapper.find('[data-testid="user-dropdown-menu"]');
    expect(dropdown.isVisible()).toBe(true);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(dropdown.isVisible()).toBe(false);
  });
});
