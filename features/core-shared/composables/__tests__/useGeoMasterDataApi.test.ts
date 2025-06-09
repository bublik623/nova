import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useGeoMasterDataApi } from "../useGeoMasterDataApi";
import { mockRuntimePublicConfig, mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

vi.mock("@/features/auth/useAuthStore");
vi.mock("@/utils/parse-ndjson", () => ({
  parseNDJSON: vi.fn(() => "parsed-data"),
}));

vi.mock("axios", async () => {
  const realAxios = await vi.importActual<typeof import("axios")>("axios");
  return {
    default: {
      create: vi.fn(() => ({
        ...realAxios.default.create(),
        get: vi.fn(),
        post: vi.fn(),
      })),
    },
  };
});

describe("useDamServiceApi", () => {
  test("it should return the correct axios instance", () => {
    const service = useGeoMasterDataApi();

    expect(service).toBeTruthy();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: mockRuntimePublicConfig.GEO_MASTER_DATA_BASE_URL,
      headers: {
        "accept-version": "vnd.geo-master-data-offer-service.v1",
      },
      params: {
        language_code: "en",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = useGeoMasterDataApi();
        const mockResponse = {
          status: 200,
          data: "data",
          config: {
            url: "slot",
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
        const { _axiosInstance } = useGeoMasterDataApi();
        const mockResponse = {
          status: 200,
          data: "data",
          config: {
            url: "slot/test-id",
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

  describe("getChangeLogs", () => {
    test("it should call the getCities  endpoint with the correct parameters", async () => {
      const { getCities, _axiosInstance } = useGeoMasterDataApi();

      await getCities();

      expect(_axiosInstance.get).toHaveBeenCalledWith("cities");
    });

    test("it should call the getCountries endpoint with the correct parameters", async () => {
      const { getCountries, _axiosInstance } = useGeoMasterDataApi();

      await getCountries();

      expect(_axiosInstance.get).toHaveBeenCalledWith("countries");
    });
  });
});
