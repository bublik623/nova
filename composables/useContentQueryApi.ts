import { AxiosInstance } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { DistributionContent, Raw } from "@/types/generated/ContentQueryApiV2";
import { Options } from "@/types/Http";
import { emit } from "@rsql/emitter";
import builder from "@rsql/builder";
import {
  TypedDistributionContentSearchHit,
  TypedRawSearchHit,
} from "@/features/advanced-search/types/seach-hit-overrides";
import { AdvancedFiltersValues, EditorialFilterKeys, RawFilterKeys } from "@/features/advanced-search/types/filters";
import { serializeToRsql } from "@/features/advanced-search/utils/serialize-to-rsql";
import { PathToLeafOf } from "@/types/PathToLeafOf";

const rawFilterAttributesMap: { [key in RawFilterKeys]: PathToLeafOf<Raw> } = {
  lastModificationDate: "updated_date",
  status: "status_code",
  city: "functional.location.address.city",
  country: "functional.location.address.country",
  supplier: "supplier_id",
  markets: "functional.markets",
  creationDate: "creation_date",
};

const editorialFilterAttributesMap: { [key in EditorialFilterKeys]: PathToLeafOf<DistributionContent> } = {
  publicationDate: "experience_media.distribution_date",
  status: "global_status",
  city: "functional_content.experience_location.address.city",
  country: "functional_content.experience_location.address.country",
  language: "experience_content.language_code",
  supplier: "supplier_id",
  markets: "functional_content.markets",
};

type ContentQueryApi = {
  _axiosInstance: AxiosInstance;
  getExperienceRawContent: ReturnType<typeof getExperienceRawContent>;
  getDistributionContent: ReturnType<typeof getDistributionContent>;
  getAllDistributionContents: ReturnType<typeof getAllDistributionContents>;
  getAllDistributionContentsV2: ReturnType<typeof getAllDistributionContentsV2>;
  getAllDistributionContentsReport: ReturnType<typeof getAllDistributionContentsReport>;
  getExperienceRawContentV3: ReturnType<typeof getExperienceRawContentV3>;
  getExperienceRawContentReport: ReturnType<typeof getExperienceRawContentReport>;
};

function getExperienceRawContent(http: AxiosInstance) {
  return async (
    params?: {
      sort?: string;
      limit?: string;
      search?: string;
      cities?: string[];
    },
    options?: Options
  ) => {
    const { config } = options || {};
    const CONTAINS = "=re=";

    const filters = [];

    if (params?.search && params?.cities) {
      filters.push(
        builder.and(
          builder.in("functional.location.address.city", params.cities),
          builder.or(
            builder.comparison("commercial.title", CONTAINS, `.*${params.search}.*`),
            builder.comparison("experience_id", CONTAINS, `.*${params.search}.*`),
            builder.comparison("reference_code", CONTAINS, `.*${params.search}.*`)
          )
        )
      );
    } else if (params?.search) {
      filters.push(
        builder.or(
          builder.comparison("commercial.title", CONTAINS, `.*${params.search}.*`),
          builder.comparison("experience_id", CONTAINS, `.*${params.search}.*`),
          builder.comparison("reference_code", CONTAINS, `.*${params.search}.*`)
        )
      );
    } else if (params?.cities) {
      filters.push(builder.in("functional.location.address.city", params.cities));
    }

    const combinedFilters = filters.length > 0 ? emit(builder.and(...filters)) : undefined;

    const { data } = await http.get<Raw[]>(`/v2/experience-raw-content`, {
      params: {
        limit: params?.limit,
        sort: params?.sort,
        filters: combinedFilters,
      },
      ...config,
    });

    return { data: data || [] };
  };
}

function getAllDistributionContents(http: AxiosInstance) {
  return async (
    params?: {
      sort?: string;
      limit?: string;
      search?: string;
    },
    options?: Options
  ) => {
    const { config } = options || {};

    const CONTAINS = "=re=";

    const { data } = await http.get<DistributionContent[]>(`/distribution-content`, {
      params: {
        limit: params?.limit,
        sort: params?.sort,
        filters: params?.search
          ? emit(
              builder.or(
                builder.and(
                  builder.eq(editorialFilterAttributesMap.language, "en"),
                  builder.comparison(
                    "experience_content.experience_translation.title",
                    CONTAINS,
                    `.*${params.search}.*`
                  )
                ),
                builder.comparison("experience_content.experience_id", CONTAINS, `.*${params.search}.*`),
                builder.comparison("reference_code", CONTAINS, `.*${params.search}.*`)
              )
            )
          : emit(builder.eq(editorialFilterAttributesMap.language, "en")),
      },
      ...config,
    });

    return { data };
  };
}

function getDistributionContent(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options ?? {};
    const { data } = await http.get<DistributionContent>(`/distribution-content/${id}`, config);

    return { data };
  };
}

function getAllDistributionContentsV2(http: AxiosInstance) {
  return async (
    params?: {
      sort?: string;
      offset?: string | number;
      limit?: string | number;
      query?: string;
      pagination?: boolean;
      filters?: AdvancedFiltersValues;
    },
    options?: Options
  ) => {
    const { config } = options || {};

    const { data, headers } = await http.get<TypedDistributionContentSearchHit[]>(`/distribution-content`, {
      params: {
        limit: params?.limit,
        sort: params?.sort,
        query: params?.query,
        offset: params?.offset,
        pagination: params?.pagination,
        filters: params?.filters ? serializeToRsql(params.filters, editorialFilterAttributesMap) : undefined,
      },
      headers: {
        "accept-version": "vnd.content-query-offer-service.v2",
      },
      ...config,
    });
    return { data, headers };
  };
}

function getAllDistributionContentsReport(http: AxiosInstance) {
  return async (
    params?: {
      sort?: string;
      query?: string;
      filters?: AdvancedFiltersValues;
      fields?: PathToLeafOf<DistributionContent>[];
    },
    options?: Options
  ) => {
    const { config } = options || {};

    const { data, headers } = await http.post<ArrayBuffer>(
      `/distribution-content/report`,
      {
        sort: params?.sort,
        query: params?.query,
        filters: params?.filters ? serializeToRsql(params.filters, editorialFilterAttributesMap) : undefined,
        fields: params?.fields?.join(","),
      },
      {
        headers: {
          "accept-version": "vnd.content-query-offer-service.v1",
        },
        responseType: "arraybuffer",
        ...config,
      }
    );
    return { data, headers };
  };
}

function getExperienceRawContentV3(http: AxiosInstance) {
  return async (
    params?: {
      sort?: string;
      offset?: string | number;
      limit?: string | number;
      query?: string;
      pagination?: boolean;
      filters?: AdvancedFiltersValues;
    },
    options?: Options
  ) => {
    const { config } = options || {};

    const { data, headers } = await http.get<TypedRawSearchHit[]>(`/experience-raw-content`, {
      params: {
        limit: params?.limit,
        sort: params?.sort,
        query: params?.query,
        offset: params?.offset,
        pagination: params?.pagination,
        filters: params?.filters ? serializeToRsql(params.filters, rawFilterAttributesMap) : undefined,
      },
      headers: {
        "accept-version": "vnd.content-query-offer-service.v3",
      },
      ...config,
    });

    return { data: data || [], headers };
  };
}

function getExperienceRawContentReport(http: AxiosInstance) {
  return async (
    params?: {
      sort?: string;
      query?: string;
      filters?: AdvancedFiltersValues;
      fields?: PathToLeafOf<Raw>[];
    },
    options?: Options
  ) => {
    const { config } = options || {};

    const { data, headers } = await http.post<ArrayBuffer>(
      `/experience-raw-content/report`,
      {
        sort: params?.sort,
        query: params?.query,
        filters: params?.filters ? serializeToRsql(params.filters, rawFilterAttributesMap) : undefined,
        fields: params?.fields?.join(","),
      },
      {
        headers: {
          "accept-version": "vnd.content-query-offer-service.v1",
        },
        responseType: "arraybuffer",
        ...config,
      }
    );

    return { data, headers };
  };
}

/**
 * Content Query Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns get - Public method for get requests, TS already configured
 */
export function useContentQueryApi(): ContentQueryApi {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: config.public.CONTENT_QUERY_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.content-query-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getExperienceRawContent: getExperienceRawContent(axiosInstance),
    getAllDistributionContents: getAllDistributionContents(axiosInstance),
    getDistributionContent: getDistributionContent(axiosInstance),
    getAllDistributionContentsV2: getAllDistributionContentsV2(axiosInstance),
    getAllDistributionContentsReport: getAllDistributionContentsReport(axiosInstance),
    getExperienceRawContentV3: getExperienceRawContentV3(axiosInstance),
    getExperienceRawContentReport: getExperienceRawContentReport(axiosInstance),
  };
}
