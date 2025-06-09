import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";
import { ndjsonInterceptor } from "@/features/core-shared/utils/http/ndjson-interceptor";

interface CharlieExperience {
  code: string;
  incoming_office: string;
  default_name: string;
}
interface CharlieModality {
  code: string;
  experience_id: string;
  default_name: string;
}

type CharlieContentMasterDataApi = {
  _axiosInstance: AxiosInstance;
  getExperiences: <T extends CharlieExperience[]>(
    url: "experiences",
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
  getModalities: <T extends CharlieModality[]>(
    url: "modalities",
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
};

/**
 * Charlie Content Master Data Service interface
 */
export function useCharlieContentMasterDataApi(): CharlieContentMasterDataApi {
  const config = useRuntimeConfig();
  const axiosInstance = axios.create({
    baseURL: config.public.CHARLIE_CONTENT_MASTER_DATA_SERVICE_BASE_URL,
  });

  axiosInstance.interceptors.response.use(ndjsonInterceptor);

  return {
    _axiosInstance: axiosInstance,
    getExperiences: axiosInstance.get,
    getModalities: axiosInstance.get,
  };
}
