import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useContentAnalyticsApi } from "../useContentAnalyticsApi";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { AvailableLanguage } from "@/types/Language";

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

const params = {
  experience_id: "experience-id",
  language_code: "en" as AvailableLanguage,
  start_date: "2050-01-01",
  end_date: "2050-02-01",
};

describe("useContentAnalyticsApi", () => {
  test("it should return the correct axios instance", () => {
    const service = useContentAnalyticsApi();

    expect(service).toBeTruthy();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "content-analytics-test-url",
      headers: {
        "accept-version": "vnd.content-analytics-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = useContentAnalyticsApi();
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
        const { _axiosInstance } = useContentAnalyticsApi();
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
    test("it should call the correct API endpoint with the correct parameters", async () => {
      const { getChangeLogs, _axiosInstance } = useContentAnalyticsApi();

      await getChangeLogs(params);

      expect(_axiosInstance.get).toHaveBeenCalledWith("/change-logs", {
        params,
      });
    });
  });
});
