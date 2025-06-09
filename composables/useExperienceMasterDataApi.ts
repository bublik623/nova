import { AxiosInstance } from "axios";
import {
  AdditionalService,
  Category,
  Interest,
  HierarchicalGroup,
  Highlights,
  ImportantInformation,
  Included,
  Market,
  BookingQuestion,
  Pax,
} from "@/types/generated/ExperienceMasterDataApi";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { AvailableLanguage } from "@/types/Language";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { Options } from "@/types/Http";

export type ExperienceMasterDataItem = Highlights | Included | ImportantInformation | AdditionalService;
export type ExperienceMasterData = ExperienceMasterDataItem[];

export type ExperienceMasterDataEndpoint = "highlights" | "included" | "important-information" | "additional-services";

export interface PremadeItemCreate {
  name: string;
  code: string;
  language_code: "en";
  hierarchical_group_code?: string;
}

export interface PremadeItemTranslate {
  code: string;
  languages: {
    language_code: string;
    to_be_translated: boolean;
  }[];
}

export interface HierarchicalGroupCreate {
  language_code: "en";
  code: string;
  name: string;
}

export interface HierarchicalGroupCreateV2 {
  group: HierarchicalGroupCreate;
  manual_languages: string[];
  automatic_languages: string[];
}

type ExperienceMasterDataApi = {
  _axiosInstance: AxiosInstance;
  getCategories: ReturnType<typeof getCategories>;
  getInterests: ReturnType<typeof getInterests>;
  getMarkets: ReturnType<typeof getMarkets>;
  createPremadeHighlight: ReturnType<typeof createPremadeHighlight>;
  createMultipleItemsV2: ReturnType<typeof createMultipleItemsV2>;
  translatePremadeHighlight: ReturnType<typeof translatePremadeHighlight>;
  getHierarchicalGroups: ReturnType<typeof getHierarchicalGroups>;
  getPremades: ReturnType<typeof getPremades>;
  createHierarchicalGroup: ReturnType<typeof createHierarchicalGroup>;
  createHierarchicalGroupV2: ReturnType<typeof createHierarchicalGroupV2>;
  updatePremade: ReturnType<typeof updatePremade>;
  updateHierarchicalGroup: ReturnType<typeof updateHierarchicalGroup>;
  getBookingQuestions: ReturnType<typeof getBookingQuestions>;
  getPax: ReturnType<typeof getPax>;
};

function getPremades(http: AxiosInstance) {
  return async (
    endpoint: ExperienceMasterDataEndpoint,
    params?: { code?: string; language_code?: AvailableLanguage; id?: string },
    options?: Options
  ) => {
    const { config } = options ?? {};

    const filtersToApply = [];

    if (params?.language_code) {
      filtersToApply.push(builder.eq("language_code", params.language_code));
    }

    if (params?.code) {
      filtersToApply.push(builder.eq("code", params.code));
    }

    if (params?.id) {
      filtersToApply.push(builder.eq("id", params.id));
    }

    const filters = filtersToApply.length ? emit(builder.and(...filtersToApply)) : undefined;

    const { data } = await http.get<ExperienceMasterData>(endpoint, {
      params: { filters },
      ...config,
    });

    return { data };
  };
}

function getHierarchicalGroups(http: AxiosInstance) {
  return async (params?: { code?: string; language_code?: AvailableLanguage }, options?: Options) => {
    const { config } = options ?? {};

    const filtersToApply = [];

    if (params?.language_code) {
      filtersToApply.push(builder.eq("language_code", params.language_code));
    }

    if (params?.code) {
      filtersToApply.push(builder.eq("code", params.code));
    }

    const filters = filtersToApply.length ? emit(builder.and(...filtersToApply)) : undefined;

    const { data } = await http.get<HierarchicalGroup[]>("hierarchical-groups", {
      params: { filters },
      ...config,
    });

    return { data };
  };
}

function createHierarchicalGroup(http: AxiosInstance) {
  return async (item: HierarchicalGroupCreate, options?: Options) => {
    const { config } = options ?? {};

    const { data } = await http.post<HierarchicalGroup>("hierarchical-groups", item, config);

    return { data };
  };
}

function createHierarchicalGroupV2(http: AxiosInstance) {
  return async (item: HierarchicalGroupCreateV2, options?: Options) => {
    const { config } = options ?? {};

    const { data } = await http.post<HierarchicalGroup>("hierarchical-groups", item, {
      ...config,
      headers: {
        ...config?.headers,
        "accept-version": "vnd.experience-master-data-offer-service.v2",
      },
    });

    return { data };
  };
}

function updatePremade(http: AxiosInstance) {
  return async (type: ExperienceMasterDataEndpoint, item: Partial<ExperienceMasterDataItem>, options?: Options) => {
    const { config } = options ?? {};

    // removing the id since it will make the PUT fail
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...itemWithoutId } = item;
    await http.put<ExperienceMasterDataItem>(`${type}/${item.id}`, itemWithoutId, config);
  };
}

function updateHierarchicalGroup(http: AxiosInstance) {
  return async (item: Partial<HierarchicalGroup>, options?: Options) => {
    const { config } = options ?? {};

    await http.put<HierarchicalGroup>(
      `hierarchical-groups/${item.id}`,
      { code: item.code, language_code: item.language_code, name: item.name },
      config
    );
  };
}

function createPremadeHighlight(http: AxiosInstance) {
  return async (endpoint: ExperienceMasterDataEndpoint, item: PremadeItemCreate, options?: Options) => {
    const { config } = options ?? {};

    const { data } = await http.post<Highlights>(endpoint, item, config);

    return { data };
  };
}

function createMultipleItemsV2(http: AxiosInstance) {
  return async (
    endpoint: ExperienceMasterDataEndpoint,
    content: {
      items: PremadeItemCreate[];
      manual_languages: string[];
      automatic_languages: string[];
    },
    options?: Options
  ) => {
    const { config } = options ?? {};

    const { data } = await http.post(endpoint, content, {
      ...config,
      headers: {
        ...config?.headers,
        "accept-version": "vnd.experience-master-data-offer-service.v2",
      },
    });

    return { data };
  };
}

function translatePremadeHighlight(http: AxiosInstance) {
  return async (endpoint: ExperienceMasterDataEndpoint, item: PremadeItemTranslate, options?: Options) => {
    const { config } = options ?? {};

    const { data } = await http.post(endpoint + "/translate", item, config);

    return { data };
  };
}

function getMarkets(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options ?? {};

    const filters = emit(builder.eq("language_code", config?.params.language_code || "en"));

    const { data } = await http.get<Market[]>("markets", {
      params: { filters },
      ...config,
    });

    return { data };
  };
}

function getInterests(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options ?? {};

    const filters = emit(builder.eq("language_code", config?.params.language_code || "en"));

    const { data } = await http.get<Interest[]>("interests", {
      params: { filters },
      ...config,
    });

    return { data };
  };
}

function getCategories(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options ?? {};

    const filters = emit(builder.eq("language_code", config?.params.language_code || "en"));

    const { data } = await http.get<Category[]>("categories", {
      params: { filters },
      ...config,
    });

    return { data };
  };
}

function getBookingQuestions(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<BookingQuestion[]>(`/booking-questions`, {
      ...config,
    });

    return { data };
  };
}

function getPax(http: AxiosInstance) {
  return async (paxType: Pax["type"], options?: Options) => {
    const { config } = options ?? {};

    const filters = emit(
      builder.and(builder.eq("type", paxType), builder.eq("language_code", config?.params.language_code || "en"))
    );

    const { data } = await http.get<Pax[]>("/pax", {
      ...config,
      params: { filters },
    });

    return { data };
  };
}

/**
 * Experience Master Data Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns get - Public method for get requests, TS already configured
 */
export function useExperienceMasterDataApi(): ExperienceMasterDataApi {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: config.public.EXPERIENCE_MASTER_DATA_SERVICE_BASE_URL,
      headers: {
        "accept-version": "vnd.experience-master-data-offer-service.v1",
      },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getCategories: getCategories(axiosInstance),
    getInterests: getInterests(axiosInstance),
    getMarkets: getMarkets(axiosInstance),
    createPremadeHighlight: createPremadeHighlight(axiosInstance),
    createMultipleItemsV2: createMultipleItemsV2(axiosInstance),
    translatePremadeHighlight: translatePremadeHighlight(axiosInstance),
    getHierarchicalGroups: getHierarchicalGroups(axiosInstance),
    createHierarchicalGroup: createHierarchicalGroup(axiosInstance),
    createHierarchicalGroupV2: createHierarchicalGroupV2(axiosInstance),
    getPremades: getPremades(axiosInstance),
    updatePremade: updatePremade(axiosInstance),
    updateHierarchicalGroup: updateHierarchicalGroup(axiosInstance),
    getBookingQuestions: getBookingQuestions(axiosInstance),
    getPax: getPax(axiosInstance),
  };
}
