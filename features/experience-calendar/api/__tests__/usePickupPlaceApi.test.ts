import axios from "axios";
import { describe, expect, test, vi } from "vitest";
import { usePickupPlaceApi } from "../usePickupPlaceApi";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { PickupPlace } from "@/types/generated/PickupPlaceServiceApi";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

vi.mock("@/features/auth/useAuthStore");
vi.mock("@/utils/parse-ndjson", () => ({
  parseNDJSON: vi.fn(() => "parsed-data"),
}));

const postMock = vi.fn(() => ({ data: undefined }));

vi.mock("axios", async () => {
  const realAxios = await vi.importActual<typeof import("axios")>("axios");
  return {
    default: {
      create: vi.fn(() => ({
        ...realAxios.default.create(),
        get: vi.fn(),
        post: postMock,
      })),
    },
  };
});

describe("usePickupPlaceApi", () => {
  test("it should return the correct axios instance", () => {
    const service = usePickupPlaceApi();

    expect(service).toBeTruthy();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "test-pickup-place-service-url",
      headers: {
        "accept-version": "vnd.pickup-place-offer-service.v1",
      },
    });
  });

  describe("interceptors", () => {
    describe("when the response type is x-ndjson", () => {
      test("it should parse the response data", () => {
        const { _axiosInstance } = usePickupPlaceApi();
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
        const { _axiosInstance } = usePickupPlaceApi();
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

  test("it should create a pickup correctly", async () => {
    const pickupPlace: PickupPlace = {
      supplier_id: "7e87fdf3-e96d-4783-9dac-2ecb957cf943",
      name: "Entity name",
      type: "Hotel",
      latitude: "39.573696612860154",
      longitude: "2.643315064536297",
      city: "London",
      country: "England",
      address: "10 Downing Street. SW1A 2AA. London. England.",
      labels: ["Museum"],
      status: "ACTIVE",
      created_at: "2022-07-14T18:17:21.926Z",
    };

    const api = usePickupPlaceApi();

    await api.createPickupPlace(pickupPlace);

    expect(postMock).toHaveBeenCalledWith("/pickup-places", pickupPlace, undefined);
  });
});
