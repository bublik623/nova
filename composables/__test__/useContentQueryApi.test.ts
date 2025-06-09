import axios from "axios";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as serializeToRsqlModule from "@/features/advanced-search/utils/serialize-to-rsql";
import { useContentQueryApi } from "../useContentQueryApi";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { AdvancedFiltersValues } from "@/features/advanced-search/types/filters";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

vi.mock("@/features/auth/useAuthStore");
vi.mock("@/utils/parse-ndjson", () => ({
  parseNDJSON: vi.fn(() => "parsed-data"),
}));

const axiosGetMock = vi.fn();
vi.mock("axios", async (importOriginal) => {
  const original = await importOriginal<typeof import("axios")>();
  const realAxios = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...original,
    default: {
      create: vi.fn(() => ({
        ...realAxios.default.create(),
        get: axiosGetMock,
      })),
    },
  };
});

describe("useContentQueryApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it should return the correct axios instance", () => {
    const { getDistributionContent } = useContentQueryApi();

    expect(getDistributionContent).toBeTruthy();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "content-query-test-url",
      headers: {
        "accept-version": "vnd.content-query-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = useContentQueryApi();
        const mockResponse = {
          status: 200,
          data: "data",
          config: {
            url: "experience-translations",
          },
          headers: {
            "content-type": "application/x-ndjson",
          },
        };

        const response =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (_axiosInstance.interceptors.response as any).handlers[0].fulfilled(mockResponse);

        expect(response.data).toBe("parsed-data");
      });
    });

    describe("when the response type is json", () => {
      test("it should not parse the response data", () => {
        const { _axiosInstance } = useContentQueryApi();
        const mockResponse = {
          status: 200,
          data: "data",
          config: {
            url: "experience-translations/test-id",
          },
          headers: {
            "content-type": "application/json",
          },
        };

        const response =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (_axiosInstance.interceptors.response as any).handlers[0].fulfilled(mockResponse);

        expect(response.data).toBe("data");
      });
    });
  });

  describe("getAllDistributionContentsV2", () => {
    const getAllDistributionContentsV2Path = "/distribution-content";

    test("given valid filters it should serialize them in rsql", () => {
      const from = new Date();
      const to = new Date();
      const filters = { creationDate: { type: "date-range", value: { from, to } } } as AdvancedFiltersValues;
      const serializedFilters = "serialized-filters";
      const serializeToRsqlSpy = vi.spyOn(serializeToRsqlModule, "serializeToRsql");

      serializeToRsqlSpy.mockReturnValueOnce(serializedFilters);
      axiosGetMock.mockReturnValueOnce({ data: {}, headers: {} });

      const { getAllDistributionContentsV2 } = useContentQueryApi();

      getAllDistributionContentsV2({ filters });

      expect(serializeToRsqlSpy).toHaveBeenCalledWith(filters, expect.anything());
      expect(axiosGetMock).toHaveBeenCalledWith(
        getAllDistributionContentsV2Path,
        expect.objectContaining({
          params: expect.objectContaining({ filters: expect.stringMatching(serializedFilters) }),
        })
      );
    });

    test("given no filters it shouldn't add them to the http request", () => {
      const serializeToRsqlSpy = vi.spyOn(serializeToRsqlModule, "serializeToRsql");
      axiosGetMock.mockReturnValueOnce({ data: {}, headers: {} });

      const { getAllDistributionContentsV2 } = useContentQueryApi();

      getAllDistributionContentsV2({});

      expect(serializeToRsqlSpy).toHaveBeenCalledTimes(0);
      expect(axiosGetMock.mock.calls[0][1].filters).toBeUndefined();
    });
  });

  describe("getExperienceRawContentV3", () => {
    const getExperienceRawContentV3Path = "/experience-raw-content";
    test("given valid filters it should serialize them in rsql", () => {
      const from = new Date();
      const to = new Date();
      const filters = { creationDate: { type: "date-range", value: { from, to } } } as AdvancedFiltersValues;
      const serializedFilters = "serialized-filters";
      const serializeToRsqlSpy = vi.spyOn(serializeToRsqlModule, "serializeToRsql");

      serializeToRsqlSpy.mockReturnValueOnce(serializedFilters);
      axiosGetMock.mockReturnValueOnce({ data: {}, headers: {} });

      const { getExperienceRawContentV3 } = useContentQueryApi();

      getExperienceRawContentV3({ filters });

      expect(serializeToRsqlSpy).toHaveBeenCalledWith(filters, expect.anything());
      expect(axiosGetMock).toHaveBeenCalledWith(
        getExperienceRawContentV3Path,
        expect.objectContaining({
          params: expect.objectContaining({ filters: expect.stringMatching(serializedFilters) }),
        })
      );
    });

    test("given no filters it shouldn't add them to the http request", () => {
      const serializeToRsqlSpy = vi.spyOn(serializeToRsqlModule, "serializeToRsql");
      axiosGetMock.mockReturnValueOnce({ data: {}, headers: {} });

      const { getExperienceRawContentV3 } = useContentQueryApi();

      getExperienceRawContentV3({});

      expect(serializeToRsqlSpy).toHaveBeenCalledTimes(0);
      expect(axiosGetMock.mock.calls[0][1].filters).toBeUndefined();
    });
  });
});
