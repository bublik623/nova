import { vi, describe, it, expect } from "vitest";
import { usePermissionsStore } from "./usePermissionsStore";
import { setActivePinia, createPinia } from "pinia";

vi.mock("../lib/map-roles-to-permissions");
vi.mock("../lib/merge-roles-permissions", () => ({
  mergeRolesPermissions: vi.fn(() => ({
    read: true,
    write: false,
  })),
}));

vi.mock("@/features/auth/useAuthStore", () => ({
  useAuthStore: () => ({
    userRoles: ["admin", "user"],
  }),
}));

describe("usePermissionsStore", () => {
  setActivePinia(createPinia());

  it("should return currentRoles correctly", () => {
    const store = usePermissionsStore();

    expect(store.currentRoles).toEqual(["admin", "user"]);
  });
  it("should return currentPermissions correctly", () => {
    const store = usePermissionsStore();

    expect(store.currentPermissions).toEqual({
      read: true,
      write: false,
    });
  });
});
