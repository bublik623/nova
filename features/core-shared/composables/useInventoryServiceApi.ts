import { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { Slot } from "@/features/experience-agenda/types/Agenda";

interface Options {
  config: AxiosRequestConfig;
}

/**
 * Inventory Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns getSlots - Request the slots for an experience
 */
export function useInventoryServiceApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.INVENTORY_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.inventory.v1" },
    },
    auth,
  });

  function getSlot(http: AxiosInstance) {
    return async (slotId: string, options?: Options) => {
      const { config } = options || {};

      return http.get<Slot>(`/slots/${slotId}`, config);
    };
  }

  function getSlots(http: AxiosInstance) {
    return async (experienceId: string, options?: Options) => {
      const { config } = options || {};

      return http.get<Slot[]>(`/slots`, {
        ...config,
        params: {
          ...config?.params,
          experience_id: experienceId,
        },
      });
    };
  }

  function postSlotCapacity(http: AxiosInstance) {
    return async (slotId: string, newCapacity: number, options?: Options) => {
      const { config } = options || {};

      return http.post(
        `/slots/update-capacity`,
        { id: slotId, capacity: newCapacity },
        {
          ...config,
          params: {
            ...config?.params,
          },
        }
      );
    };
  }

  function postEnabling(http: AxiosInstance) {
    return async (timeslice_ids: string[], enable: boolean, options?: Options) => {
      const { config } = options || {};

      return http.post(
        `/slots/enabling`,
        { timeslice_ids, enable },
        {
          ...config,
          params: {
            ...config?.params,
          },
        }
      );
    };
  }

  return {
    _axiosInstance: axiosInstance,
    getSlot: getSlot(axiosInstance),
    getSlots: getSlots(axiosInstance),
    postSlotCapacity: postSlotCapacity(axiosInstance),
    postEnabling: postEnabling(axiosInstance),
  };
}
