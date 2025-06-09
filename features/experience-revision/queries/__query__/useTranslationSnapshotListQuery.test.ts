import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslationSnapshotListQuery, Snapshot } from "../useTranslationSnapshotListQuery";
import { config, flushPromises, shallowMount } from "@vue/test-utils";
import { QueryClient, UseQueryReturnType } from "@tanstack/vue-query";
import { Snapshot as ApiSnapshot } from "@/types/Snapshots";

const getAllSnapshotsMock = vi.hoisted(() => vi.fn());

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => ({
    getAllSnapshots: getAllSnapshotsMock,
  }),
}));

let query: UseQueryReturnType<Snapshot[], Error> | undefined = undefined;

const experienceId = "EXP-1";

const dataFromAPIs: ApiSnapshot[] = [
  {
    id: "snapshot-1",
    creation_date: "2025-01-24T14:12:23.630Z",
    updated_date: "2025-01-24T14:14:27.261Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v6",
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
  },
  {
    id: "snapshot-2",
    creation_date: "2025-01-24T14:08:47.859Z",
    updated_date: "2025-01-24T14:09:19.097Z",
    experience_id: experienceId,
    reference_code: "EXP-REF-CODE-1",
    supplier_id: "SUPPLIER-1",
    version_id: "v4",
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
  },
];

const expectedResultFromQuery: Snapshot[] = dataFromAPIs.map((dto) => ({
  ...dto,
  creation_date: new Date(dto.creation_date),
}));

describe("useTranslationSnapshotListQuery", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // disable retry otherwise tests that cover error cases would time-out
    config.global.provide.VUE_QUERY_CLIENT = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  it("should fetch the translation snapshots for the given experience", async () => {
    getAllSnapshotsMock.mockResolvedValue({ data: dataFromAPIs });

    await setupQuery(ref(experienceId));

    expect(query).not.toBeUndefined();

    expect(getAllSnapshotsMock).toHaveBeenCalledOnce();
    expect(getAllSnapshotsMock).toHaveBeenCalledWith(experienceId);
  });

  it("should map the data fetched from APIs into object of Snapshot type where creation_date field is a Date", async () => {
    getAllSnapshotsMock.mockResolvedValue({ data: dataFromAPIs });

    await setupQuery(ref(experienceId));

    expect(query).not.toBeUndefined();
    expect(query?.data.value).toStrictEqual(expectedResultFromQuery);
  });

  it("should set error state when the backend endpoint return an error", async () => {
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    getAllSnapshotsMock.mockRejectedValue(error);

    await setupQuery(ref(experienceId));

    expect(query).not.toBeUndefined();
    expect(query!.status.value).toBe("error");
    expect(query!.isError.value).toBe(true);
    expect(query!.error.value).toStrictEqual(error);
  });
});

async function setupQuery(experienceId: Ref<string>) {
  shallowMount(getComponent(experienceId));
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 200));
}

function getComponent(experienceId: Ref<string>) {
  return defineComponent({
    setup: () => {
      query = useTranslationSnapshotListQuery(experienceId);
    },
    template: "<div></div>",
  });
}
