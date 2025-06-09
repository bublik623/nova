import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useExperienceRawApi, SupplierWithoutEventsError } from "../useExperienceRawApi";
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

describe("useExperienceRawApi", () => {
  test("it should return the correct axios instance", () => {
    const { getRawExperience } = useExperienceRawApi();

    expect(getRawExperience).toBeTruthy();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-url",
      headers: {
        "accept-version": "vnd.experience-raw-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = useExperienceRawApi();
        const mockResponse = {
          status: 200,
          data: "data",
          config: {
            url: "experience-raw",
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
        const { _axiosInstance } = useExperienceRawApi();
        const mockResponse = {
          status: 200,
          data: "data",
          config: {
            url: "experience-raw/test-id",
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

  describe("createDistributionContent", () => {
    test("it should create distribution content successfully", async () => {
      const { createDistributionContent, _axiosInstance } = useExperienceRawApi();
      const mockPost = vi.fn().mockResolvedValue({
        headers: {
          location: "/distribution-content/123",
        },
      });
      _axiosInstance.post = mockPost;

      const payload = { key: "value" };
      const options = { config: { headers: { Authorization: "Bearer token" } } };

      const result = await createDistributionContent(payload, options);

      expect(_axiosInstance.post).toHaveBeenCalledWith("/distribution-content", payload, options.config);
      expect(result).toEqual({ data: "123" });
    });

    test("it should throw SupplierWithoutEventsError for SUPPLIER_NOT_FOUND error", async () => {
      const { createDistributionContent, _axiosInstance } = useExperienceRawApi();
      const mockPost = vi.fn().mockRejectedValue({
        response: {
          data: {
            code: "SUPPLIER_NOT_FOUND",
          },
        },
      });
      _axiosInstance.post = mockPost;

      const payload = { key: "value" };
      const options = { config: { headers: { Authorization: "Bearer token" } } };

      await expect(createDistributionContent(payload, options)).rejects.toThrowError(new SupplierWithoutEventsError());
      expect(_axiosInstance.post).toHaveBeenCalledWith("/distribution-content", payload, options.config);
    });

    test("it should throw a generic error for other errors", async () => {
      const { createDistributionContent, _axiosInstance } = useExperienceRawApi();
      const mockPost = vi.fn().mockRejectedValue(new Error("Generic error"));
      _axiosInstance.post = mockPost;

      const payload = { key: "value" };
      const options = { config: { headers: { Authorization: "Bearer token" } } };

      await expect(createDistributionContent(payload, options)).rejects.toThrow("Generic error");
      expect(_axiosInstance.post).toHaveBeenCalledWith("/distribution-content", payload, options.config);
    });
  });
});
