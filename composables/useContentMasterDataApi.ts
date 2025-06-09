import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";

import { ContentStatus } from "@/types/generated/ContentMasterDataApi";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";

type ContentMasterDataEndpoint = "content-statuses";

type ContentMasterDataApi = {
  _axiosInstance: AxiosInstance;
  get: <T extends ContentStatus[]>(
    url: ContentMasterDataEndpoint,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
};

/**
 * Content Master Data Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns get - Public method for get requests, TS already configured
 */
export function useContentMasterDataApi(): ContentMasterDataApi {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: config.public.CONTENT_MASTER_DATA_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.content-master-data-offer-service.v1" },
      params: { language_code: "en" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    get: axiosInstance.get,
  };
}
