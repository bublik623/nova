import { mapHighlightsToGroups, UNCATEGORIZED_HIERARCHICAL_GROUP_KEY } from "../map-highlights-to-groups";
import { ExperienceMasterDataItem } from "@/composables/useExperienceMasterDataApi";
import { describe, test, expect } from "vitest";

describe("mapHighlightsToGroups", () => {
  const items = [
    { id: "1", hierarchical_group_code: "GROUP1" },
    { id: "2", hierarchical_group_code: "GROUP2" },
    { id: "3", hierarchical_group_code: "GROUP1" },
    { id: "4", hierarchical_group_code: null },
    { id: "5", hierarchical_group_code: undefined },
  ];

  test("should map items to groups correctly", () => {
    const groups = mapHighlightsToGroups(items as ExperienceMasterDataItem[]);

    expect(groups.size).toBe(3);
    expect(groups.get("GROUP1")).toEqual([items[0], items[2]]);
    expect(groups.get("GROUP2")).toEqual([items[1]]);
    expect(groups.get(UNCATEGORIZED_HIERARCHICAL_GROUP_KEY)).toEqual([items[3], items[4]]);
  });

  test("should handle empty input correctly", () => {
    const groups = mapHighlightsToGroups([]);

    expect(groups.size).toBe(1);
    expect(groups.get(UNCATEGORIZED_HIERARCHICAL_GROUP_KEY)).toEqual([]);
  });
});
