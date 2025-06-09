import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useContentMasterDataApi } from "../useContentMasterDataApi";
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

describe("useContentMasterDataApi", () => {
  test("it should return the correct axios instance", () => {
    const { get } = useContentMasterDataApi();

    expect(get).toBeTruthy();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "content-master-data-test-url",
      headers: {
        "accept-version": "vnd.content-master-data-offer-service.v1",
      },
      params: {
        language_code: "en",
      },
    });
  });

  describe("interceptors", () => {
    test("it should parse the response data", () => {
      const { _axiosInstance } = useContentMasterDataApi();
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
});
