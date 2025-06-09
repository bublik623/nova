import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useContentCommandApi } from "../useContentCommandApi";
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

describe("useContentCommandApi", () => {
  test("it should return the correct axios instance", () => {
    const { getTranslation } = useContentCommandApi();

    expect(getTranslation).toBeTruthy();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-url",
      headers: {
        "accept-version": "vnd.content-command-offer-service.v1",
      },
    });
  });
});

describe("interceptors", () => {
  describe("when the response type is x-ndjson", () => {
    test("it should parse the response data", () => {
      const { _axiosInstance } = useContentCommandApi();
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
      const { _axiosInstance } = useContentCommandApi();
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
