import axios from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useExperienceMasterDataApi } from "../useExperienceMasterDataApi";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

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
      })),
    },
  };
});

describe("useExperienceMasterDataApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  test("it should return the correct axios instance", () => {
    const { getPremades } = useExperienceMasterDataApi();

    expect(getPremades).toBeTruthy();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-url",
      headers: {
        "accept-version": "vnd.experience-master-data-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    test("it should parse the response data", () => {
      const { _axiosInstance } = useExperienceMasterDataApi();
      const mockResponse = {
        status: 200,
        data: "data",
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

  describe("getBookingQuestions", () => {
    test("it should call the endpoint with the correct parameters", async () => {
      const { getBookingQuestions, _axiosInstance } = useExperienceMasterDataApi();
      const mockGet = vi.fn().mockResolvedValue({ data: [] });
      _axiosInstance.get = mockGet;
      const expectedParams = { config: { params: { test: "params" } } };

      await getBookingQuestions(expectedParams);
      expect(_axiosInstance.get).toHaveBeenCalledWith("/booking-questions", {
        params: expectedParams.config.params,
      });
    });
  });
});
