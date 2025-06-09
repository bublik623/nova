import { describe, expect, it } from "vitest";
import { mergeRolesPermissions } from "./merge-roles-permissions";
import { PermissionRecord } from "../types/permissions.types";

describe("mergeRolesPermissions", () => {
  it("when merging, it should prefer true values over false values", () => {
    const recs = [
      { read: true, write: true },
      { read: false, write: false },
    ];
    const result = mergeRolesPermissions(recs as unknown as PermissionRecord[]);
    expect(result).toEqual({
      read: true,
      write: true,
    });
  });
});
