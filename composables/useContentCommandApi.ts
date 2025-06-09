import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  ExperienceTranslation,
  ExperienceCommercialContent,
  Flow,
  ExperienceMedia,
  ServiceCodeTranslation,
  OptionTranslation,
  LanguageTranslation,
} from "@/types/generated/ContentCommandApi";
import { AvailableLanguage } from "@/types/Language";
import { GenericHighlight, CustomHighlightsEndpoint } from "@/types/Highlights";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { emit } from "@rsql/emitter";
import builder from "@rsql/builder";

interface ContentCommandConfig extends AxiosRequestConfig {
  params: {
    language_code: AvailableLanguage;
  };
}

type ContentCommandApi = {
  _axiosInstance: AxiosInstance;
  getTranslation: <T extends ExperienceTranslation>(
    url: `experience-translations/${string}`,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  getTranslations: <T extends ExperienceTranslation[]>(
    url: "experience-translations",
    config?: ContentCommandConfig
  ) => Promise<AxiosResponse<T>>;

  putTranslation: <T extends ExperienceTranslation>(
    url: `experience-translations/${string}`,
    data: T
  ) => Promise<AxiosResponse>;

  postTranslation: <T extends ExperienceTranslation>(url: "experience-translations", data: T) => Promise<AxiosResponse>;

  putExperienceMedia: <T extends ExperienceMedia>(url: `experience-media/${string}`, data: T) => Promise<AxiosResponse>;

  postImage: <T extends { file_name: string; preview_url: string }>(
    url: "v2/images",
    data: T
  ) => Promise<AxiosResponse>;

  putImage: <T extends FormData>(
    url: `images/${string}`,
    data: T,
    config: { headers: { "Content-Type": "multipart/form-data" } }
  ) => Promise<AxiosResponse>;

  deleteImage: (url: `v2/images/${string}`) => Promise<AxiosResponse>;

  getExperienceCommercialContent: <T extends ExperienceCommercialContent[]>(
    url: "experience-commercial-content",
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  getFlows: <T extends Flow[]>(url: "flows", config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;

  getCustomHighlights: <T extends GenericHighlight[]>(
    url: CustomHighlightsEndpoint,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  postCustomHighlight: <T extends Omit<GenericHighlight, "id">>(
    url: CustomHighlightsEndpoint,
    data: T,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  putCustomHighlight: <T extends Omit<GenericHighlight, "id">>(
    url: `${CustomHighlightsEndpoint}/${string}`,
    data: T,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  deleteCustomHighlight: <T extends GenericHighlight[]>(
    url: `${CustomHighlightsEndpoint}/${string}`,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  translateExperience: (
    url: `/experiences/${string}/translate`,
    payload: {
      language_list: LanguageTranslation[];
    }
  ) => Promise<AxiosResponse<unknown>>;

  publishTranslation: ReturnType<typeof publishTranslation>;

  unpublishExperience: ReturnType<typeof unpublishExperience>;

  getServiceCodeTranslations: ReturnType<typeof getServiceCodeTranslations>;
  putServiceCodeTranslation: ReturnType<typeof putServiceCodeTranslation>;
  getOptionTranslations: ReturnType<typeof getOptionTranslations>;
  putOptionTranslation: ReturnType<typeof putOptionTranslation>;
};

function publishTranslation(axiosInstance: AxiosInstance) {
  /**
   * Publishes the experience for the language on the query.
   *
   * @param force - if "force" is true, it wil remove "unpublish" status if exists.
   */
  return async (experienceId: string, languageCode: AvailableLanguage, force = false) => {
    return axiosInstance.post(`/experiences/${experienceId}/publish`, undefined, {
      params: {
        language_code: languageCode,
        experience_id: experienceId,
        force,
      },
    });
  };
}

function unpublishExperience(axiosInstance: AxiosInstance) {
  return async (experienceId: string, languageCode: AvailableLanguage) => {
    return axiosInstance.post(`/experiences/${experienceId}/unpublish`, undefined, {
      params: {
        language_code: languageCode,
        experience_id: experienceId,
      },
    });
  };
}

function getServiceCodeTranslations(axiosInstance: AxiosInstance) {
  return async (experienceId: string, languageCode: AvailableLanguage) => {
    const filters = emit(
      builder.and(builder.eq("experience_id", experienceId), builder.eq("language_code", languageCode))
    );

    return axiosInstance.get<Array<ServiceCodeTranslation>>(`/service-code-translations`, { params: { filters } });
  };
}

function putServiceCodeTranslation(axiosInstance: AxiosInstance) {
  return async (serviceCodeTranslation: ServiceCodeTranslation) => {
    const { id, ...updatePayload } = serviceCodeTranslation;
    return axiosInstance.put(`/service-code-translations/${id}`, updatePayload);
  };
}

function getOptionTranslations(axiosInstance: AxiosInstance) {
  return async (experienceId: string, languageCode: AvailableLanguage) => {
    const filters = emit(
      builder.and(builder.eq("experience_id", experienceId), builder.eq("language_code", languageCode))
    );

    return axiosInstance.get<Array<OptionTranslation>>(`/option-translations`, { params: { filters } });
  };
}

function putOptionTranslation(axiosInstance: AxiosInstance) {
  return async (optionTranslation: OptionTranslation) => {
    const { id, ...updatePayload } = optionTranslation;
    return axiosInstance.put(`/option-translations/${id}`, updatePayload);
  };
}
export function useContentCommandApi(): ContentCommandApi {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: config.public.CONTENT_COMMAND_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.content-command-offer-service.v1" },
    },
    auth,
  });

  const axiosInstanceV2 = createHttpInstance({
    config: {
      baseURL: config.public.CONTENT_COMMAND_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.content-command-offer-service.v2" },
    },
    auth,
  });

  return {
    getTranslation: axiosInstance.get,
    getTranslations: axiosInstance.get,
    putTranslation: axiosInstance.put,
    postTranslation: axiosInstance.post,
    putExperienceMedia: axiosInstance.put,
    postImage: axiosInstanceV2.post,
    putImage: axiosInstance.put,
    deleteImage: axiosInstanceV2.delete,
    getExperienceCommercialContent: axiosInstance.get,
    getFlows: axiosInstance.get,
    getCustomHighlights: axiosInstance.get,
    postCustomHighlight: axiosInstance.post,
    putCustomHighlight: axiosInstance.put,
    deleteCustomHighlight: axiosInstance.delete,
    translateExperience: axiosInstanceV2.post,
    publishTranslation: publishTranslation(axiosInstance),
    unpublishExperience: unpublishExperience(axiosInstance),
    getServiceCodeTranslations: getServiceCodeTranslations(axiosInstance),
    putServiceCodeTranslation: putServiceCodeTranslation(axiosInstance),
    getOptionTranslations: getOptionTranslations(axiosInstance),
    putOptionTranslation: putOptionTranslation(axiosInstance),
    _axiosInstance: axiosInstance,
  };
}
