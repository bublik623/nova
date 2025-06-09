import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useMetadataExperienceApi } from "../useMetadataExperienceApi";
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

describe("useMetadataExperienceApi", () => {
  test("it should return the correct axios instance", () => {
    const { get } = useMetadataExperienceApi();

    expect(get).toBeTruthy();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-url",
      headers: {
        "accept-version": "vnd.metadata-experience-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    test("it should parse the response data", () => {
      const { _axiosInstance } = useMetadataExperienceApi();
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
