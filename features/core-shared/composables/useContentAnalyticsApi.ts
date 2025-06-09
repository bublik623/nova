import { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { ChangeLog } from "@/types/generated/ContentAnalyticsApi";
import { AvailableLanguage } from "@/types/Language";

interface Options {
  config: AxiosRequestConfig;
}

interface ContentAnalyticsParams {
  experience_id: string;
  language_code: AvailableLanguage;
  start_date: string;
  end_date: string;
}

/**
 * Content Analytics interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns getLogs - Request the logs for an experience
 */
export function useContentAnalyticsApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.CONTENT_ANALYTICS_SERVICE_BASE_URL,
      headers: {
        "accept-version": "vnd.content-analytics-offer-service.v1",
      },
    },
    auth,
  });

  function getChangeLogs(http: AxiosInstance) {
    return async (params: ContentAnalyticsParams, options?: Options) => {
      const { config } = options || {};

      return http.get<ChangeLog>(`/change-logs`, {
        ...config,
        params,
      });
    };
  }

  return {
    _axiosInstance: axiosInstance,
    getChangeLogs: getChangeLogs(axiosInstance),
  };
}
