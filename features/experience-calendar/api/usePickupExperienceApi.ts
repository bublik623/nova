import { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { Pickup } from "@/types/generated/PickupExperienceServiceApi";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";

interface Options {
  config: AxiosRequestConfig;
}

function getPickupsByOptionId(http: AxiosInstance) {
  return async (optionId: string, options?: Options) => {
    const { config } = options || {};

    const params = {
      filters: emit(builder.eq("option_id", optionId)),
    };

    const { data } = await http.get<Pickup[]>(`/pickups`, {
      ...config,
      params: {
        ...config?.params,
        ...params,
      },
    });

    return { data: data?.[0] };
  };
}

function getPickupById(http: AxiosInstance) {
  /**
   * @param id - pickup id
   */
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<Pickup>(`/pickups/${id}`, config);

    return { data };
  };
}

function createPickup(http: AxiosInstance) {
  /**
   * Creates a pickup into the offer.
   */
  return async (payload: Pick<Pickup, "supplier_id" | "pickup_place_ids" | "option_id">, options?: Options) => {
    const { config } = options || {};

    const body = {
      ...payload,
    };

    const { headers } = await http.post<{ id: string }>(`/pickups`, body, config);

    if (!headers.location) {
      throw new Error(`No location in headers for pickup: ${JSON.stringify(body)}`);
    }

    const createdPickupId = headers.location.split("/")?.[2];

    return { data: createdPickupId };
  };
}

function updatePickup(http: AxiosInstance) {
  /**
   * updates a pickup
   * @param id - pickup id
   */
  return async (
    id: string,
    payload: Pick<Pickup, "supplier_id" | "pickup_place_ids" | "option_id">,
    options?: Options
  ) => {
    const { config } = options || {};

    const body = {
      ...payload,
    };

    const { data } = await http.put<boolean>(`/pickups/${id}`, body, config);

    return { data };
  };
}

function deletePickup(http: AxiosInstance) {
  /**
   * deletes a pickup
   * @param id - pickup id
   */
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.delete<boolean>(`/pickups/${id}`, config);

    return { data };
  };
}

/**
 * Pickup Experience Api
 *
 * @link https://source.tui/dx/architecture/open-api-specifications/-/blob/master/private-api-models/offer-and-sourcing-domain/offer/pickup-experience-offer-service-openapi.yaml
 */
export function usePickupExperienceApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.PICKUP_EXPERIENCE_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.pickup-experience-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getPickupById: getPickupById(axiosInstance),
    createPickup: createPickup(axiosInstance),
    updatePickup: updatePickup(axiosInstance),
    deletePickup: deletePickup(axiosInstance),
    getPickupsByOptionId: getPickupsByOptionId(axiosInstance),
  };
}
