import { describe, test, expect, vi } from "vitest";
import { usePremadesFiltering } from "../usePremadesFiltering";

describe("usePremadesFiltering", () => {
  test("matchingItems.value should be null if given premades is null", async () => {
    const { matchingItems } = usePremadesFiltering(ref(null), ref("not relevant query"));

    expect(matchingItems.value).toBeNull();
  });

  test("count.value should equals to the total number of premades when the given query is blank", async () => {
    const { count } = usePremadesFiltering(ref(premades), ref(""));

    expect(count.value).toEqual(premades.length);
  });

  test("matchingItems.value should contains all the given premades when the given query is blank", async () => {
    const { matchingItems } = usePremadesFiltering(ref(premades), ref(""));

    expect(matchingItems.value).toEqual(premades);
  });

  test("count.value should equals to the number of premades that match the query", async () => {
    const { count } = usePremadesFiltering(ref(premades), ref("0"));

    expect(count.value).toEqual(3); //
  });

  test("matchingItems.value should contains all the premades whose name contains the query string (applying a case insensitive comparison)", async () => {
    const query = ref("");
    const { matchingItems } = usePremadesFiltering(ref(premades), query);

    query.value = "me of preMAde3";

    expect(matchingItems.value).toEqual([premades.at(3)]);
  });

  test("matchingPremades.value should contains all the premades whose hierarchical_group name contains the query string (applying a case insensitive comparison)", async () => {
    const query = ref("");
    const { matchingItems } = usePremadesFiltering(ref(premades), query);

    query.value = "rchICal group 1";

    expect(matchingItems.value).toEqual([premades.at(1), premades.at(3)]);
  });
});

const hierarchicalGroups = new Map(
  Object.entries({
    "code of hierarchical group 0": {
      id: "id of hierarchical group 0",
      language_code: "language_code of hierarchical group 0",
      code: "code of hierarchical group 0",
      name: "hierarchical group 0",
      description: "description of hierarchical group 0",
      parent_code: "parent code of hierarchical group 0",
    },
    "code of hierarchical group 1": {
      id: "id of hierarchical group 1",
      language_code: "language_code of hierarchical group 1",
      code: "code of hierarchical group 1",
      name: "hierarchical group 1",
      description: "description of hierarchical group 1",
      parent_code: "parent code of hierarchical group 1",
    },
  })
);

const premades = Array.from(Array(5).keys()).map((index) => ({
  id: `id of premade${index}`,
  code: `code of premade${index}`,
  name: `name of premade${index}`,
  description: `description of premade${index}`,
  language_code: `language_code of premade${index}`,
  hierarchical_group_code: `code of hierarchical group ${index % 2}`,
}));

const masterDataStoreMock = {
  hierarchicalGroups,
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataStoreMock,
}));
