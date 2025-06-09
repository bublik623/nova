import { beforeEach, describe, expect, it, vi } from "vitest";
import { Snapshot, TRANSLATION_SNAPSHOT_LIST_QUERY_KEY } from "../../queries/useTranslationSnapshotListQuery";
import { getParentMasterLanguageSnapshot } from "../get-parent-master-language-snapshot";
import { QueryClient } from "@tanstack/vue-query";

const queryFactoryMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/experience-revision/queries/useTranslationSnapshotListQuery", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/experience-revision/queries/useTranslationSnapshotListQuery")>()),
  useTranslationSnapshotListQuery: queryFactoryMock,
}));

const queryClientFactoryMock = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/vue-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/vue-query")>()),
  useQueryClient: queryClientFactoryMock,
}));

let queryClient: QueryClient | undefined = undefined;

const experienceId = "EXP-1";
const snapshotId = "SNAP-4";

const snapshotList: Snapshot[] = [
  {
    id: "SNAP-5",
    creation_date: new Date("2025-01-25T14:12:23.630Z"),
    updated_date: "2025-01-25T14:14:27.261Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v5",
    version_status: "ACTIVE",
    user_version: "john.doe",
    experience_functional_information: {
      external_reference_code: "",
      interests: { codes: [""] },
      categories: { codes: [""] },
      additional_services: { codes: [""] },
      markets: { codes: [""] },
      booking_information: {},
    },
    experience_commercial_information: {
      translations: [
        {
          language_code: "en",
        },
      ],
    },
  },
  {
    id: "SNAP-4",
    creation_date: new Date("2025-01-24T14:12:23.630Z"),
    updated_date: "2025-01-24T14:14:27.261Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v4",
    version_status: "ACTIVE",
    user_version: "john.doe",
    experience_functional_information: {
      external_reference_code: "",
      interests: { codes: [""] },
      categories: { codes: [""] },
      additional_services: { codes: [""] },
      markets: { codes: [""] },
      booking_information: {},
    },
    experience_commercial_information: {
      translations: [
        {
          language_code: "it",
        },
      ],
    },
  },
  {
    id: "SNAP-3",
    creation_date: new Date("2025-01-23T14:12:23.630Z"),
    updated_date: "2025-01-23T14:14:27.261Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v3",
    version_status: "ARCHIVED",
    user_version: "john.doe",
    experience_functional_information: {
      external_reference_code: "",
      interests: { codes: [""] },
      categories: { codes: [""] },
      additional_services: { codes: [""] },
      markets: { codes: [""] },
      booking_information: {},
    },
    experience_commercial_information: {
      translations: [
        {
          language_code: "es",
        },
      ],
    },
  },
  {
    id: "SNAP-2",
    creation_date: new Date("2025-01-22T14:12:23.630Z"),
    updated_date: "2025-01-22T14:14:27.261Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v2",
    version_status: "ARCHIVED",
    user_version: "john.doe",
    experience_functional_information: {
      external_reference_code: "",
      interests: { codes: [""] },
      categories: { codes: [""] },
      additional_services: { codes: [""] },
      markets: { codes: [""] },
      booking_information: {},
    },
    experience_commercial_information: {
      translations: [
        {
          language_code: "en",
        },
      ],
    },
  },
  {
    id: "SNAP-1",
    creation_date: new Date("2025-01-21T14:12:23.630Z"),
    updated_date: "2025-01-21T14:14:27.261Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v1",
    version_status: "ARCHIVED",
    user_version: "john.doe",
    experience_functional_information: {
      external_reference_code: "",
      interests: { codes: [""] },
      categories: { codes: [""] },
      additional_services: { codes: [""] },
      markets: { codes: [""] },
      booking_information: {},
    },
    experience_commercial_information: {
      translations: [
        {
          language_code: "en",
        },
      ],
    },
  },
];

describe("getParentMasterLanguageSnapshot", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    queryClient = { ensureQueryData: vi.fn() } as unknown as QueryClient;
    queryClientFactoryMock.mockReturnValue(queryClient);

    const translationListQuery = { data: ref(snapshotList) };
    queryFactoryMock.mockReturnValue(translationListQuery);
  });

  it("should ensure data of translation snapshot list query for the given experienceId is loaded", async () => {
    const result = await getParentMasterLanguageSnapshot(experienceId, snapshotId);

    expect(result).not.toBeUndefined();
    expect(queryClient!.ensureQueryData).toHaveBeenCalledOnce();
    expect(queryClient!.ensureQueryData).toHaveBeenCalledWith({
      queryKey: [TRANSLATION_SNAPSHOT_LIST_QUERY_KEY, ref(experienceId)],
    });
  });

  it("should return the most recent snapshot of master language content that have been created before the given snapshot", async () => {
    const result = await getParentMasterLanguageSnapshot(experienceId, snapshotId);

    expect(result).not.toBeUndefined();
    expect(result).toStrictEqual(snapshotList[3]);
  });
});
