import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useCharlieContentMasterDataApi } from "../useCharlieContentMasterDataApi";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

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

describe("useCharlieContentMasterDataApi", () => {
  test("it should return the correct axios instance", () => {
    const { getExperiences } = useCharlieContentMasterDataApi();

    expect(getExperiences).toBeTruthy();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "charlie-master-data-test-url",
    });
  });
});

describe("interceptors", () => {
  describe("when the response type is x-ndjson", () => {
    test("it should parse the response data", () => {
      const { _axiosInstance } = useCharlieContentMasterDataApi();
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
      const { _axiosInstance } = useCharlieContentMasterDataApi();
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
