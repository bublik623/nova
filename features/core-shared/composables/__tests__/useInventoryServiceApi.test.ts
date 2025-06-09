import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { useInventoryServiceApi } from "../useInventoryServiceApi";
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

describe("useInventoryServiceApi", () => {
  test("it should return the correct axios instance", () => {
    const service = useInventoryServiceApi();

    expect(service).toBeTruthy();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-inventory-service-url",
      headers: {
        "accept-version": "vnd.inventory.v1",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = useInventoryServiceApi();
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
        const { _axiosInstance } = useInventoryServiceApi();
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

  describe("getSlot", () => {
    test("it should call the correct API endpoint with the correct parameters", async () => {
      const { getSlot, _axiosInstance } = useInventoryServiceApi();
      const expectedParams = { config: { params: { test: "params" } } };

      await getSlot("slot-id", expectedParams);

      expect(_axiosInstance.get).toHaveBeenCalledWith("/slots/slot-id", {
        params: {
          ...expectedParams.config.params,
        },
      });
    });
  });

  describe("getSlots", () => {
    test("it should call the correct API endpoint with the correct parameters", async () => {
      const { getSlots, _axiosInstance } = useInventoryServiceApi();
      const expectedParams = { config: { params: { test: "params" } } };

      await getSlots("exp-id", expectedParams);

      expect(_axiosInstance.get).toHaveBeenCalledWith("/slots", {
        params: {
          ...expectedParams.config.params,
          experience_id: "exp-id",
        },
      });
    });
  });

  describe("postSlotCapacity", () => {
    test("it should call the correct API endpoint with the correct parameters", async () => {
      const { postSlotCapacity, _axiosInstance } = useInventoryServiceApi();

      await postSlotCapacity("slot-id", 50);

      expect(_axiosInstance.post).toHaveBeenCalledWith(
        "/slots/update-capacity",
        {
          id: "slot-id",
          capacity: 50,
        },
        { params: {} }
      );
    });
  });

  describe("postSlotCapacity", () => {
    test("it should call the correct API endpoint with the correct parameters", async () => {
      const { postEnabling, _axiosInstance } = useInventoryServiceApi();

      await postEnabling(["slot-id"], true);

      expect(_axiosInstance.post).toHaveBeenCalledWith(
        "/slots/enabling",
        {
          timeslice_ids: ["slot-id"],
          enable: true,
        },
        { params: {} }
      );
    });
  });
});
