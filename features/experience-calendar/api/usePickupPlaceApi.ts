import { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { emit } from "@rsql/emitter";
import builder from "@rsql/builder";
import { PickupPlaceWithId } from "../types/Pickups";
import { PickupPlace } from "@/types/generated/PickupPlaceServiceApi";
import { getIdFromLocation } from "@/features/core-shared/utils/http/http-utils";

interface Options {
  config: AxiosRequestConfig;
}

function getPickupPlaces(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<PickupPlaceWithId[]>(`/pickup-places`, config);

    return { data };
  };
}

function getPickupPlacesByIds(http: AxiosInstance) {
  /**
   * @param ids pickup ids e.g. ["id-1", "id-2"]
   */
  return async (ids: string[], options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<PickupPlaceWithId[]>(`/pickup-places`, {
      params: {
        filters: emit(builder.in("id", ids)),
      },
      ...config,
    });

    return { data };
  };
}

function createPickupPlace(http: AxiosInstance) {
  return async (pickupPlace: PickupPlace, options?: Options) => {
    const { config } = options || {};

    const { headers } = await http.post<PickupPlace["id"]>(`/pickup-places`, pickupPlace, config);

    const locationId = getIdFromLocation(headers?.location);

    return { data: locationId };
  };
}

/**
 * Pickup Place Api
 *
 * @link https://source.tui/dx/architecture/open-api-specifications/-/blob/master/private-api-models/offer-and-sourcing-domain/offer/pickup-experience-offer-service-openapi.yaml
 */
export function usePickupPlaceApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.PICKUP_PLACE_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.pickup-place-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getPickupPlaces: getPickupPlaces(axiosInstance),
    getPickupPlacesByIds: getPickupPlacesByIds(axiosInstance),
    createPickupPlace: createPickupPlace(axiosInstance),
  };
}
