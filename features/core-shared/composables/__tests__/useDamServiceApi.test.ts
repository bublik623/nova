import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useDamServiceApi } from "../useDamServiceApi";
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
        post: vi.fn(),
      })),
    },
  };
});

describe("useDamServiceApi", () => {
  test("it should return the correct axios instance", () => {
    const service = useDamServiceApi();

    expect(service).toBeTruthy();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-dam-service-url",
      headers: {
        "accept-version": "vnd.dam-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = useDamServiceApi();
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
        const { _axiosInstance } = useDamServiceApi();
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
      const { getImages, _axiosInstance } = useDamServiceApi();

      await getImages("experience-id");

      expect(_axiosInstance.get).toHaveBeenCalledWith("/experiences/experience-id/images");
    });
  });
});
