import { vi, describe, test, expect, beforeEach } from "vitest";
import { useServiceAndModalitiesTitleListQuery } from "../useServiceAndModalitiesTitleListQuery";
import { config, flushPromises, shallowMount } from "@vue/test-utils";
import { QueryClient, UseQueryReturnType } from "@tanstack/vue-query";
import { ServiceAndModalitiesTitleListValue } from "@/features/experience-shared/asterix-integration/asterix-service-and-modalities-titles/types/service-and-modalities-title-list-value";
import { AsxExperience, ModalityCodes } from "@/types/generated/ExperienceRawServiceApi";

const getAsterixServicesMock = vi.hoisted(() => vi.fn());
const getAsterixModalitiesMock = vi.hoisted(() => vi.fn());

vi.mock("@/composables/useExperienceRawApi", () => ({
  useExperienceRawApi: () => ({
    getAsterixServices: getAsterixServicesMock,
    getAsterixModalities: getAsterixModalitiesMock,
  }),
}));

let query: UseQueryReturnType<ServiceAndModalitiesTitleListValue, Error> | undefined = undefined;

const asterixServices: Array<AsxExperience> = [
  {
    code: "SVC-1",
  },
  {
    code: "SVC-2",
    default_name: "default name of SVC-2",
  },
];
const asterixModalities: Array<ModalityCodes> = [
  {
    code: "MOD-1",
    linked: true,
    experience_id: "exp-id",
  },
  {
    code: "MOD-2",
    default_name: "default name of MOD-2",
    linked: true,
    experience_id: "exp-id",
  },
  {
    code: "MOD-3",
    default_name: "default name of MOD-3",
    linked: true,
    experience_id: "exp-id",
  },
  {
    code: "MOD-4",
    default_name: "default name of MOD-4",
    linked: true,
    experience_id: "exp-id",
  },
  {
    code: "MOD-5",
    default_name: "default name of MOD-5",
    linked: true,
    experience_id: "exp-id",
  },
];
const expectedQueryData: ServiceAndModalitiesTitleListValue = [
  {
    serviceCode: asterixServices[0].code!,
    title: "", // testing default title value when missing in response payload
    modalities: [
      {
        modalityCode: asterixModalities[0].code!,
        title: "", // testing default title value when missing in response payload
      },
      {
        modalityCode: asterixModalities[1].code!,
        title: asterixModalities[1].default_name!,
      },
    ],
  },
  {
    serviceCode: asterixServices[1].code!,
    title: asterixServices[1].default_name!,
    modalities: [
      {
        modalityCode: asterixModalities[2].code!,
        title: asterixModalities[2].default_name!,
      },
      {
        modalityCode: asterixModalities[3].code!,
        title: asterixModalities[3].default_name!,
      },
      {
        modalityCode: asterixModalities[4].code!,
        title: asterixModalities[4].default_name!,
      },
    ],
  },
];

describe("useServiceAndModalitiesTitleListQuery", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // disable retry otherwise tests that cover error cases would time-out
    config.global.provide.VUE_QUERY_CLIENT = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  test("it should return an empty array when serviceCode is empty", async () => {
    const serviceCodes: Array<string> = [];

    await setupQuery(ref(serviceCodes));

    expect(query).not.toBeUndefined();
    expect(query?.data.value).toStrictEqual([]);

    expect(getAsterixServicesMock).not.toHaveBeenCalled();
    expect(getAsterixModalitiesMock).not.toHaveBeenCalled();
  });

  test("it should fetch the asterix service for each of the given service codes", async () => {
    const serviceCodes = ["SVC-1", "SVC-2"];

    await setupQuery(ref(serviceCodes));

    expect(query).not.toBeUndefined();
    expect(getAsterixServicesMock).toHaveBeenCalledWith(serviceCodes[0], 0, 100);
    expect(getAsterixServicesMock).toHaveBeenCalledWith(serviceCodes[1], 0, 100);
  });

  test("it should set error state when the asterix service endpoint return an error", async () => {
    const serviceCodes = ["SVC-1", "SVC-2"];
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    getAsterixServicesMock.mockRejectedValue(error);
    getAsterixModalitiesMock.mockResolvedValue({ data: asterixModalities });

    await setupQuery(ref(serviceCodes));

    expect(query).not.toBeUndefined();
    expect(query!.status.value).toBe("error");
    expect(query!.isError.value).toBe(true);
    expect(query!.error.value).toStrictEqual(error);
  });

  test("it should fetch the asterix modalities for each of the given service codes", async () => {
    const serviceCodes = ["SVC-1", "SVC-2"];

    await setupQuery(ref(serviceCodes));

    expect(query).not.toBeUndefined();
    expect(getAsterixModalitiesMock).toHaveBeenCalledWith(serviceCodes[0], 0, 100);
    expect(getAsterixModalitiesMock).toHaveBeenCalledWith(serviceCodes[1], 0, 100);
  });

  test("it should set error state when the asterix modalities endpoint return an error", async () => {
    const serviceCodes = ["SVC-1", "SVC-2"];
    const error = {
      code: "ERR_BAD_REQUEST",
      message: "Request failed with status code 400",
    };

    getAsterixServicesMock.mockReturnValue({ data: asterixServices });
    getAsterixModalitiesMock.mockRejectedValue(error);

    await setupQuery(ref(serviceCodes));

    expect(query).not.toBeUndefined();
    expect(query!.status.value).toBe("error");
    expect(query!.isError.value).toBe(true);
    expect(query!.error.value).toStrictEqual(error);
  });

  test("it should map the data retrieved from APIs into a parent->child (service->modalities) item list", async () => {
    const serviceCodes = ["SVC-1", "SVC-2"];

    // SVC-1
    getAsterixServicesMock.mockResolvedValueOnce({ data: [asterixServices[0]] });
    getAsterixModalitiesMock.mockResolvedValueOnce({ data: [asterixModalities[0], asterixModalities[1]] });

    // SVC-2
    getAsterixServicesMock.mockResolvedValueOnce({ data: [asterixServices[1]] });
    getAsterixModalitiesMock.mockResolvedValueOnce({
      data: [asterixModalities[2], asterixModalities[3], asterixModalities[4]],
    });

    await setupQuery(ref(serviceCodes));

    expect(query).not.toBeUndefined();
    expect(query?.data.value).toStrictEqual(expectedQueryData);
  });
});

async function setupQuery(serviceCodes: Ref<Array<string>>) {
  shallowMount(getComponent(serviceCodes));
  await flushPromises();
}

function getComponent(serviceCodes: Ref<Array<string>>) {
  return defineComponent({
    setup: () => {
      query = useServiceAndModalitiesTitleListQuery(serviceCodes);
    },
    template: "<div></div>",
  });
}
