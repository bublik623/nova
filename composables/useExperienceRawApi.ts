import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  AsxExperience,
  DistributionContent,
  ExperienceExternalCatalog,
  ExternalCatalogLinkRequestDto,
  MediaSnapshot,
  ModalityCodes,
  RawElement,
  RawSnapshot,
} from "@/types/generated/ExperienceRawServiceApi";
import { Snapshot } from "@/types/Snapshots";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { Options } from "@/types/Http";
import { getIdFromLocation } from "@/features/core-shared/utils/http/http-utils";
import { emit } from "@rsql/emitter";
import builder from "@rsql/builder";
import { AvailableLanguage } from "@/types/Language";

export type UseExperienceRawApi = {
  _axiosInstance: AxiosInstance;
  getRawExperience: <T extends RawElement>(
    url: `experience-raw/${string}`,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  getRawExperiences: <T extends RawElement[]>(
    url: `experience-raw`,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;

  putRawExperience: <T extends RawElement>(url: `experience-raw/${string}`, data: T) => Promise<AxiosResponse>;

  postRawExperience: <T extends RawElement>(url: `experience-raw`, data: T) => Promise<AxiosResponse>;

  deleteRawExperience: (url: `experience-raw/${string}`) => Promise<AxiosResponse>;
  createDistributionContent: ReturnType<typeof createDistributionContent>;
  getExperienceRawV2: ReturnType<typeof getExperienceRawV2>;
  getExperienceRawV2ByExperienceId: ReturnType<typeof getExperienceRawV2>;
  createExperienceRaw: ReturnType<typeof createExperienceRaw>;
  updateExperienceRaw: ReturnType<typeof updateExperienceRaw>;
  updateExperienceRawV2: ReturnType<typeof updateExperienceRawV2>;
  deleteDistributionContent: ReturnType<typeof deleteDistributionContent>;
  getDistributionContent: ReturnType<typeof getDistributionContent>;
  updateDistributionContent: ReturnType<typeof updateDistributionContent>;
  patchDistributionContent: ReturnType<typeof patchDistributionContent>;
  getAllRawSnapshots: ReturnType<typeof getAllRawSnapshots>;
  getMostRecentRawSnapshot: ReturnType<typeof getMostRecentRawSnapshot>;
  getAllSnapshots: ReturnType<typeof getAllSnapshots>;
  getAllTranslationSnapshots: ReturnType<typeof getAllTranslationSnapshots>;
  getAllMediaSnapshots: ReturnType<typeof getAllMediaSnapshots>;
  getSingleSnapshot: ReturnType<typeof getSingleSnapshot>;
  getLastTwoSnapshots: ReturnType<typeof getLastTwoSnapshots>;
  getSingleRawSnapshot: ReturnType<typeof getSingleRawSnapshot>;
  getAsterixServices: ReturnType<typeof getAsterixServices>;
  getAsterixModalities: ReturnType<typeof getAsterixModalities>;
  getExternalExperiences: ReturnType<typeof getExternalExperiences>;
  getLinkedExternalExperience: ReturnType<typeof getLinkedExternalExperience>;
  linkExternalExperience: ReturnType<typeof linkExternalExperience>;
  unlinkExternalExperience: ReturnType<typeof unlinkExternalExperience>;
  sendToReview: ReturnType<typeof sendToReview>;
};

export class SupplierWithoutEventsError extends Error {}

function createDistributionContent(http: AxiosInstance) {
  const SUPPLIER_NOT_FOUND_ERROR_CODE: string = "SUPPLIER_NOT_FOUND";

  return async (payload: Partial<DistributionContent>, options?: Options) => {
    const { config } = options || {};

    try {
      const { headers } = await http.post<DistributionContent[]>(`/distribution-content`, payload, config);

      const id = getIdFromLocation(headers?.location);

      return { data: id };
    } catch (err: any) {
      const errorCode = err?.response?.data?.code;
      if (errorCode === SUPPLIER_NOT_FOUND_ERROR_CODE) {
        throw new SupplierWithoutEventsError();
      }

      throw err;
    }
  };
}

function getExperienceRawV2ByExperienceId(http: AxiosInstance) {
  return async (experienceId: string, config?: AxiosRequestConfig) => {
    const { data } = await http.get<RawElement[]>(`/v2/experience-raw`, {
      params: {
        filters: emit(builder.eq("experience_id", experienceId)),
      },
      ...config,
    });
    return { data: data?.[0] };
  };
}

function getExperienceRawV2(http: AxiosInstance) {
  return async (rawId: string, config?: AxiosRequestConfig) => {
    const { data } = await http.get<RawElement>(`/v2/experience-raw/${rawId}`, config);
    return { data };
  };
}

function createExperienceRaw(http: AxiosInstance) {
  return async (experienceId: string, title: string, options?: Options) => {
    const { config } = options || {};

    const body: Omit<RawElement, "status_code" | "flow_code"> = {
      experience_id: experienceId,
      commercial: {
        title,
      },
    };

    const { headers } = await http.post(`/v2/experience-raw`, body, config);

    const id = getIdFromLocation(headers?.location);

    return { data: id };
  };
}

function updateExperienceRawV2(http: AxiosInstance) {
  return async (rawId: string, payload: RawElement) => {
    const { data } = await http.put(`/v2/experience-raw/${rawId}`, payload);
    return { data };
  };
}

function updateExperienceRaw(http: AxiosInstance) {
  return async (rawId: string, payload: Partial<RawElement>) => {
    const { data } = await http.patch(`/experience-raw/${rawId}`, payload);
    return { data };
  };
}

function deleteDistributionContent(http: AxiosInstance) {
  return async (rawId: string) => {
    const { data } = await http.delete(`/distribution-content/${rawId}`);
    return { data };
  };
}

function getDistributionContent(http: AxiosInstance) {
  return async (experienceId: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<DistributionContent>(`/distribution-content/${experienceId}`, config);

    return { data };
  };
}

function updateDistributionContent(http: AxiosInstance) {
  return async (experienceId: string, payload: DistributionContent, options?: Options) => {
    const config = options || {};
    const { data } = await http.put<boolean>(`/distribution-content/${experienceId}`, payload, config);
    return { data };
  };
}

function patchDistributionContent(http: AxiosInstance) {
  return async (experienceId: string, payload: Partial<DistributionContent>, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.patch<boolean>(`/distribution-content/${experienceId}`, payload, config);

    return { data };
  };
}

function getAllRawSnapshots(http: AxiosInstance) {
  return async (experienceId: string) => {
    const { data } = await http.get<RawSnapshot[]>(`/raw-snapshot`, {
      params: {
        filters: emit(builder.eq("raw.experience_id", experienceId)),
        sort: "-snapshotDate",
      },
    });

    return { data };
  };
}

function getSingleRawSnapshot(http: AxiosInstance) {
  return async (snapshotId: string) => {
    const { data } = await http.get<RawSnapshot>(`/raw-snapshot/${snapshotId}`);
    return { data };
  };
}

function getMostRecentRawSnapshot(http: AxiosInstance) {
  return async (experienceId: string) => {
    const { data } = await http.get<RawSnapshot[]>(`/raw-snapshot`, {
      params: {
        filters: emit(
          // The filter is applied to retrieve the latest published version of the raw data associated with the provided experience ID.
          // Even if modifications have been made after publishing, this filter ensures that we get the raw data in its last published ("UP_TO_DATE") state.
          // basically the state before we click `submit`, on the raw flow.
          builder.and(builder.eq("raw.experience_id", experienceId), builder.eq("raw.status_code", "UP_TO_DATE"))
        ),
        sort: "-snapshotDate",
        limit: 1,
      },
    });

    return { data: data[0] };
  };
}

function getAllSnapshots(http: AxiosInstance) {
  return async (experienceId: string) => {
    const { data } = await http.get<Snapshot[]>(`/snapshot`, {
      params: {
        filters: emit(builder.eq("experience_id", experienceId)),
        sort: "-creationDate",
      },
    });

    return { data };
  };
}

function getAllTranslationSnapshots(http: AxiosInstance) {
  return async (experienceId: string, language_code: AvailableLanguage) => {
    const { data } = await http.get<Snapshot[]>(`/translation-snapshot`, {
      params: {
        experience_id: experienceId,
        language_code,
        sort: "-creationDate",
      },
    });

    return { data };
  };
}

function getAllMediaSnapshots(http: AxiosInstance) {
  return async (experienceId: string) => {
    const { data } = await http.get<MediaSnapshot[]>(`/media-snapshot`, {
      params: {
        experience_id: experienceId,
        sort: "-creationDate",
      },
    });

    return { data };
  };
}

function getSingleSnapshot(http: AxiosInstance) {
  return async (snapshotId: string) => {
    const { data } = await http.get<Snapshot>(`/snapshot/${snapshotId}`);
    return { data };
  };
}

function getLastTwoSnapshots(http: AxiosInstance) {
  return async (experienceId: string) => {
    const { data } = await http.get<Snapshot[]>(`/snapshot`, {
      params: {
        filters: emit(
          builder.and(
            builder.eq("experience_id", experienceId),
            builder.and(
              builder.eq("experienceCommercialInformation.translations.languageCode", "en"),
              builder.eq("experienceCommercialInformation.translations.experienceTranslation.statusCode", "READY")
            )
          )
        ),
        sort: "-creationDate",
        limit: 2,
      },
    });

    return { data };
  };
}

function getAsterixServices(http: AxiosInstance) {
  return async (query: string, offset: number, limit: number) => {
    const { data } = await http.get<AsxExperience[]>(`/asx/experiences`, {
      params: { contain: query, offset, limit },
    });

    return { data };
  };
}

function getAsterixModalities(http: AxiosInstance) {
  return async (asterixServiceCode: string, offset: number, limit: number) => {
    const { data } = await http.get<ModalityCodes[]>(`/asx/experiences/${asterixServiceCode}/modalities`, {
      params: { offset, limit },
    });

    return { data };
  };
}

function getExternalExperiences(http: AxiosInstance) {
  return async (supplier_id: string) => {
    const { data } = await http.get<ExperienceExternalCatalog[]>(`/external-experiences`, {
      params: { filters: emit(builder.eq("supplier_id", supplier_id)) },
    });

    return { data };
  };
}

function getLinkedExternalExperience(http: AxiosInstance) {
  return async (experience_id: string) => {
    const { data } = await http.get<ExperienceExternalCatalog[]>(`/external-experiences`, {
      params: {
        filters: emit(builder.and(builder.eq("linked", "true"), builder.eq("experience_id", experience_id))),
      },
    });

    return { data };
  };
}

function linkExternalExperience(http: AxiosInstance) {
  return async (id: string, payload: ExternalCatalogLinkRequestDto) => {
    const { data } = await http.post(`/external-experiences/${id}/link`, payload);
    return { data };
  };
}

function unlinkExternalExperience(http: AxiosInstance) {
  return async (id: string) => {
    const { data } = await http.post(`/external-experiences/${id}/unlink`);
    return { data };
  };
}

function sendToReview(http: AxiosInstance) {
  return async (rawId: string) => {
    const { data } = await http.post(`/experience-raw/${rawId}/send-to-review`, null, {
      headers: { "accept-version": "vnd.experience-raw-offer-service.v2" },
    });
    return { data };
  };
}

/**
 * Experience Raw Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns getRawExperience - Public method for get requests, TS already configured
 * @returns getRawExperiences - Public method for get requests, TS already configured (return an array)
 * @returns putRawExperience - Public method for put requests, TS already configured
 * @returns postRawExperience - Public method for post requests, TS already configured
 */
export function useExperienceRawApi(): UseExperienceRawApi {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: config.public.EXPERIENCE_RAW_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.experience-raw-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getRawExperience: axiosInstance.get,
    getRawExperiences: axiosInstance.get,
    putRawExperience: axiosInstance.put,
    postRawExperience: axiosInstance.post,
    deleteRawExperience: axiosInstance.delete,
    createDistributionContent: createDistributionContent(axiosInstance),
    getExperienceRawV2: getExperienceRawV2(axiosInstance),
    getExperienceRawV2ByExperienceId: getExperienceRawV2ByExperienceId(axiosInstance),
    createExperienceRaw: createExperienceRaw(axiosInstance),
    updateExperienceRaw: updateExperienceRaw(axiosInstance),
    updateExperienceRawV2: updateExperienceRawV2(axiosInstance),
    deleteDistributionContent: deleteDistributionContent(axiosInstance),
    getDistributionContent: getDistributionContent(axiosInstance),
    updateDistributionContent: updateDistributionContent(axiosInstance),
    patchDistributionContent: patchDistributionContent(axiosInstance),
    getMostRecentRawSnapshot: getMostRecentRawSnapshot(axiosInstance),
    getAllRawSnapshots: getAllRawSnapshots(axiosInstance),
    getLastTwoSnapshots: getLastTwoSnapshots(axiosInstance),
    getAllSnapshots: getAllSnapshots(axiosInstance),
    getAllTranslationSnapshots: getAllTranslationSnapshots(axiosInstance),
    getAllMediaSnapshots: getAllMediaSnapshots(axiosInstance),
    getSingleSnapshot: getSingleSnapshot(axiosInstance),
    getSingleRawSnapshot: getSingleRawSnapshot(axiosInstance),
    getAsterixServices: getAsterixServices(axiosInstance),
    getAsterixModalities: getAsterixModalities(axiosInstance),
    getExternalExperiences: getExternalExperiences(axiosInstance),
    getLinkedExternalExperience: getLinkedExternalExperience(axiosInstance),
    linkExternalExperience: linkExternalExperience(axiosInstance),
    unlinkExternalExperience: unlinkExternalExperience(axiosInstance),
    sendToReview: sendToReview(axiosInstance),
  };
}
