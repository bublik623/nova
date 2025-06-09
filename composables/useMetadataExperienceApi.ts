import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { emit } from "@rsql/emitter";
import builder from "@rsql/builder";
import {
  ExperienceAdditionalService,
  ExperienceBookingInformation,
  ExperienceBookingQuestions,
  ExperienceCategories,
  ExperienceHighlights,
  ExperienceImportantInformation,
  ExperienceIncluded,
  ExperienceInterests,
  ExperienceLocation,
  ExperienceNonIncluded,
  ExperienceMarkets,
  ExperienceAdditionalCities,
  ExperienceVenues,
} from "@/types/generated/MetadataExperiencesApi";
import { Options } from "@/types/Http";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { getIdFromLocation } from "@/features/core-shared/utils/http/http-utils";

export type ExperienceMetadata =
  | ExperienceHighlights
  | ExperienceImportantInformation
  | ExperienceIncluded
  | ExperienceNonIncluded
  | ExperienceAdditionalService
  | ExperienceCategories
  | ExperienceInterests
  | ExperienceMarkets;

type MetadataExperienceApi = {
  _axiosInstance: AxiosInstance;
  get: <T extends ExperienceMetadata[]>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <D extends ExperienceMetadata>(url: string, data: D) => Promise<AxiosResponse<D>>;
  post: <D extends ExperienceMetadata>(url: string, data: D) => Promise<AxiosResponse<D>>;
  del: <D extends ExperienceMetadata>(url: string) => Promise<AxiosResponse<D>>;
  getAdditionalServices: ReturnType<typeof getAdditionalServices>;
  createAdditionalServices: ReturnType<typeof createAdditionalServices>;
  updateAdditionalServices: ReturnType<typeof updateAdditionalServices>;
  createLocation: ReturnType<typeof createLocation>;
  getLocation: ReturnType<typeof getLocation>;
  updateLocation: ReturnType<typeof updateLocation>;
  deleteLocation: ReturnType<typeof deleteLocation>;
  getBookingInfo: ReturnType<typeof getBookingInfo>;
  updateBookingInfo: ReturnType<typeof updateBookingInfo>;
  createBookingInfo: ReturnType<typeof createBookingInfo>;
  getBookingQuestions: ReturnType<typeof getBookingQuestions>;
  createBookingQuestions: ReturnType<typeof createBookingQuestions>;
  updateBookingQuestions: ReturnType<typeof updateBookingQuestions>;
  getMarkets: ReturnType<typeof getMarkets>;
  getAdditionalCitiesById: ReturnType<typeof getAdditionalCitiesById>;
  createAdditionalCities: ReturnType<typeof createAdditionalCities>;
  updateAdditionalCities: ReturnType<typeof updateAdditionalCities>;
  deleteAdditionalCities: ReturnType<typeof deleteAdditionalCities>;
  getVenuesById: ReturnType<typeof getVenuesById>;
  createVenues: ReturnType<typeof createVenues>;
  updateVenues: ReturnType<typeof updateVenues>;
  deleteVenues: ReturnType<typeof deleteVenues>;
};

function getAdditionalCitiesById(http: AxiosInstance) {
  return async (id: string): Promise<{ data: ExperienceAdditionalCities | undefined }> => {
    const { data } = await http.get<ExperienceAdditionalCities[]>("/experience-additional-cities", {
      params: {
        filters: emit(builder.eq("experience_id", id)),
      },
    });

    return {
      data: data[0],
    };
  };
}

function createAdditionalCities(http: AxiosInstance) {
  return async (
    experience_id: string,
    payload: Omit<ExperienceAdditionalCities, "experience_id">,
    options?: Options
  ) => {
    const { config } = options || {};

    const body: ExperienceAdditionalCities = {
      experience_id: experience_id,
      additional_cities: payload.additional_cities,
    };

    const { headers } = await http.post<ExperienceAdditionalCities>(`/experience-additional-cities`, body, config);
    const id = getIdFromLocation(headers?.location);

    return { data: id };
  };
}

function updateAdditionalCities(http: AxiosInstance) {
  return async (
    experience_id: string,
    additional_cities_id: string,
    payload: Omit<ExperienceAdditionalCities, "experience_id">,
    options?: Options
  ) => {
    const { config } = options || {};

    const body: ExperienceAdditionalCities = {
      experience_id: experience_id,
      additional_cities: payload.additional_cities,
    };

    const { data } = await http.put<ExperienceAdditionalCities>(
      `/experience-additional-cities/${additional_cities_id}`,
      body,
      config
    );

    return { data };
  };
}

function deleteAdditionalCities(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.delete<ExperienceAdditionalCities>(`/experience-additional-cities/${id}`, config);

    return { data };
  };
}

function getAdditionalServices(http: AxiosInstance) {
  return async (id: string) => {
    const { data } = await http.get<ExperienceAdditionalService[]>("/experience-additional-services", {
      params: {
        filters: emit(builder.eq("experience_id", id)),
      },
    });

    return {
      data: data[0],
    };
  };
}

function updateAdditionalServices(http: AxiosInstance) {
  return async (
    additionalServiceId: string,
    payload: Pick<ExperienceAdditionalService, "experience_id" | "additional_services">,
    options?: Options
  ) => {
    const { config } = options || {};

    const body: ExperienceAdditionalService = {
      experience_id: payload.experience_id,
      additional_services: payload.additional_services,
      language_code: "en",
    };

    const { data } = await http.put<ExperienceAdditionalService>(
      `/experience-additional-services/${additionalServiceId}`,
      body,
      config
    );

    return { data };
  };
}

function createAdditionalServices(http: AxiosInstance) {
  return async (
    payload: Pick<ExperienceAdditionalService, "experience_id" | "additional_services">,
    options?: Options
  ) => {
    const { config } = options || {};

    const body: ExperienceAdditionalService = {
      experience_id: payload.experience_id,
      additional_services: payload.additional_services,
      language_code: "en",
    };

    const { data } = await http.post<ExperienceAdditionalService>(`/experience-additional-services`, body, config);

    return { data };
  };
}

function getLocation(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<ExperienceLocation[]>(`/experience-location`, {
      params: { filters: emit(builder.eq("experience_id", id)) },
      ...config,
    });

    return { data: data[0] };
  };
}

function createLocation(http: AxiosInstance) {
  return async (payload: ExperienceLocation, options?: Options) => {
    const { config } = options || {};

    const { headers } = await http.post<ExperienceLocation>(`/experience-location`, payload, config);
    const id = getIdFromLocation(headers?.location);

    return { data: id };
  };
}

function updateLocation(http: AxiosInstance) {
  return async (id: string, payload: ExperienceLocation, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.put<ExperienceLocation>(`/experience-location/${id}`, payload, config);

    return { data };
  };
}

function deleteLocation(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.delete<ExperienceLocation>(`/experience-location/${id}`, config);

    return { data };
  };
}

function getBookingInfo(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<ExperienceBookingInformation[]>(`/experience-booking-information`, {
      params: { filters: emit(builder.eq("experience_id", id)) },
      ...config,
    });

    return { data: data };
  };
}

function createBookingInfo(http: AxiosInstance) {
  return async (payload: ExperienceBookingInformation, options?: Options) => {
    const { config } = options || {};

    const { data, headers } = await http.post<ExperienceBookingInformation>(
      `/experience-booking-information`,
      payload,
      config
    );

    return { data, headers };
  };
}

function updateBookingInfo(http: AxiosInstance) {
  return async (id: string, payload: ExperienceBookingInformation, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.put<ExperienceBookingInformation>(
      `/experience-booking-information/${id}`,
      payload,
      config
    );

    return { data };
  };
}

function getBookingQuestions(http: AxiosInstance) {
  return async (id: string, optionId: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<ExperienceBookingQuestions[]>(`/experience-booking-questions`, {
      params: {
        filters: emit(builder.and(builder.eq("experience_id", id), builder.eq("optionId", optionId))),
      },
      ...config,
    });

    return { data: data?.[0] };
  };
}

function createBookingQuestions(http: AxiosInstance) {
  return async (payload: Omit<ExperienceBookingQuestions, "id">, options?: Options) => {
    const { config } = options || {};

    const { headers } = await http.post(`/experience-booking-questions`, payload, config);

    // location="/experience-booking-questions/5f33c337-8d9f-46b7-87eb-172345afac42"
    const locationUrlSegments = headers.location?.split("/") || [];
    const id = locationUrlSegments.pop();

    return { data: { id } };
  };
}

function updateBookingQuestions(http: AxiosInstance) {
  return async (id: string, payload: Omit<ExperienceBookingQuestions, "id">, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.put<ExperienceBookingQuestions>(`/experience-booking-questions/${id}`, payload, config);

    return { data };
  };
}

function getMarkets(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<ExperienceMarkets[]>(`/experience-markets`, {
      params: {
        filters: emit(builder.eq("experience_id", id)),
      },
      ...config,
    });

    return { data: data[0] };
  };
}

function getVenuesById(http: AxiosInstance) {
  return async (id: string) => {
    const { data } = await http.get<ExperienceVenues[]>("/experience-venues", {
      params: {
        filters: emit(builder.eq("experience_id", id)),
      },
    });

    return {
      data: data[0],
    };
  };
}

function createVenues(http: AxiosInstance) {
  return async (experience_id: string, payload: Omit<ExperienceVenues, "experience_id">, options?: Options) => {
    const { config } = options || {};

    const body: ExperienceVenues = {
      experience_id: experience_id,
      venues: payload.venues,
    };

    const { headers } = await http.post<ExperienceVenues>(`/experience-venues`, body, config);
    const id = getIdFromLocation(headers?.location);

    return { data: id };
  };
}

function updateVenues(http: AxiosInstance) {
  return async (
    experience_id: string,
    venues_id: string,
    payload: Omit<ExperienceVenues, "experience_id">,
    options?: Options
  ) => {
    const { config } = options || {};

    const body: ExperienceVenues = {
      experience_id: experience_id,
      venues: payload.venues,
    };

    const { data } = await http.put<ExperienceVenues>(`/experience-venues/${venues_id}`, body, config);

    return { data };
  };
}

function deleteVenues(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.delete<ExperienceVenues>(`/experience-venues/${id}`, config);

    return { data };
  };
}

/**
 * Metadata Experience Service interface
 * @link https://source.tui/dx/architecture/open-api-specifications/-/blob/master/private-api-models/offer-and-sourcing-domain/offer/metadata-experience-offer-service-openapi.yaml
 *
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns get - Public method for get requests, TS already configured
 * @returns put - Public method for put requests, TS already configured
 * @returns post - Public method for post requests, TS already configured
 * @returns delete - Public method for delete requests, TS already configured
 */
export function useMetadataExperienceApi(): MetadataExperienceApi {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: config.public.METADATA_EXPERIENCE_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.metadata-experience-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    get: axiosInstance.get,
    put: axiosInstance.put,
    post: axiosInstance.post,
    del: axiosInstance.delete,
    getAdditionalServices: getAdditionalServices(axiosInstance),
    createAdditionalServices: createAdditionalServices(axiosInstance),
    updateAdditionalServices: updateAdditionalServices(axiosInstance),
    createLocation: createLocation(axiosInstance),
    getLocation: getLocation(axiosInstance),
    updateLocation: updateLocation(axiosInstance),
    deleteLocation: deleteLocation(axiosInstance),
    updateBookingInfo: updateBookingInfo(axiosInstance),
    createBookingInfo: createBookingInfo(axiosInstance),
    getBookingInfo: getBookingInfo(axiosInstance),
    getBookingQuestions: getBookingQuestions(axiosInstance),
    createBookingQuestions: createBookingQuestions(axiosInstance),
    updateBookingQuestions: updateBookingQuestions(axiosInstance),
    getMarkets: getMarkets(axiosInstance),
    getAdditionalCitiesById: getAdditionalCitiesById(axiosInstance),
    createAdditionalCities: createAdditionalCities(axiosInstance),
    updateAdditionalCities: updateAdditionalCities(axiosInstance),
    deleteAdditionalCities: deleteAdditionalCities(axiosInstance),
    getVenuesById: getVenuesById(axiosInstance),
    createVenues: createVenues(axiosInstance),
    updateVenues: updateVenues(axiosInstance),
    deleteVenues: deleteVenues(axiosInstance),
  };
}
