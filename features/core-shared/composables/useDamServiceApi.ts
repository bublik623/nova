import { AxiosInstance } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { Image as DamImage } from "@/types/generated/DamServiceApi";

/**
 * Dam Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns getImages - Request the Fotoware images tagged for a specific experience
 */
export function useDamServiceApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.DAM_SERVICE_BASE_URL,
      headers: {
        "accept-version": "vnd.dam-offer-service.v1",
      },
    },
    auth,
  });

  function getImages(http: AxiosInstance) {
    return async (experienceId: string) => {
      return http.get<DamImage[]>(`/experiences/${experienceId}/images`);
    };
  }

  return {
    _axiosInstance: axiosInstance,
    getImages: getImages(axiosInstance),
  };
}
