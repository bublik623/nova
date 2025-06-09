import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Experience, Pricing, ExperienceType, RefundPolicy } from "@/types/generated/OfferServiceApiOld";
import {
  Option,
  ExperiencePaxes,
  Pricing as NewPricing,
  OptionPaxes,
  ExperienceLanguages,
  Allotment,
  InternalPricing,
} from "@/types/generated/OfferServiceApi";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { AvailabilityType } from "@/features/experience-calendar/types/Availability";
import { INSTANT_DURATION } from "@/constants/date.constants";
import { emit } from "@rsql/emitter";
import builder from "@rsql/builder";

interface Options {
  config: AxiosRequestConfig;
}

const ACCEPT_VERSION_2_HEADER_VALUE = "vnd.offer-experience-offer-service.v2";

function getExperienceTypeTicketEndpoint(type: ExperienceType) {
  let endpoint: string;

  switch (type) {
    case "CALENDAR-TIMESLOTS":
      endpoint = "/datetime-tickets";
      break;
    case "CALENDAR-NO-TIMESLOTS":
      endpoint = "/date-tickets";
      break;
    case ExperienceType.NO_CALENDAR_FIXED_END:
      endpoint = "/open-tickets";
      break;
    case ExperienceType.NO_CALENDAR_FIXED_VALIDITY:
      endpoint = "/open-tickets";
      break;
    default:
      endpoint = "/datetime-tickets";
      break;
  }

  return endpoint;
}

function getPricings(http: AxiosInstance) {
  return async (experienceId: string, optionId: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<Pricing[]>(`/pricings`, {
      params: {
        experience: experienceId,
        option: optionId,
      },
      ...config,
    });

    return { data };
  };
}

function createPricing(http: AxiosInstance) {
  return async (pricing: Pricing | NewPricing, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.post<Pricing | NewPricing>(
      `/pricings`,
      {
        ...pricing,
      },
      config
    );

    return { data };
  };
}

function updatePricing(http: AxiosInstance) {
  return async (pricing: Pricing | NewPricing, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.put<Pricing | NewPricing>(
      `/pricings/${pricing.id}`,
      {
        ...pricing,
      },
      config
    );

    return { data };
  };
}

function deletePricing(http: AxiosInstance) {
  return async (pricingId: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.delete<boolean>(`/pricings/${pricingId}`, config);

    return { data };
  };
}

function getAvailabilities(http: AxiosInstance) {
  return async <T extends AvailabilityType>(optionId: string, type: ExperienceType, options?: Options) => {
    const endpoint = getExperienceTypeTicketEndpoint(type);
    const { config } = options || {};
    const { data } = await http.get<T[]>(endpoint, {
      params: { option: optionId },
      ...config,
    });

    return { data };
  };
}

function createAvailability(http: AxiosInstance) {
  return async <D extends AvailabilityType>(availability: Omit<D, "id">, type: ExperienceType, options?: Options) => {
    const endpoint = getExperienceTypeTicketEndpoint(type);
    const { config } = options || {};

    const { data } = await http.post<D>(endpoint, availability, config);

    return { data };
  };
}

function updateAvailability(http: AxiosInstance) {
  return async <T extends AvailabilityType>(availability: T, type: ExperienceType, options?: Options) => {
    const endpoint = getExperienceTypeTicketEndpoint(type);
    const { config } = options || {};

    const { data } = await http.put<T>(`${endpoint}/${availability.id}`, availability, config);

    return { data };
  };
}

function deleteAvailability(http: AxiosInstance) {
  return async (id: string, type: ExperienceType, options?: Options) => {
    const endpoint = getExperienceTypeTicketEndpoint(type);
    const { config } = options || {};

    const { data } = await http.delete<boolean>(`${endpoint}/${id}`, config);

    return { data };
  };
}

function getRefundPolicies(http: AxiosInstance) {
  return async (experienceId: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<RefundPolicy[]>(`/refund-policies`, {
      params: {
        experience: experienceId,
      },
      ...config,
    });

    return { data };
  };
}

function postRefundPolicy(http: AxiosInstance) {
  return async (policy: RefundPolicy, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.post<never, AxiosResponse<RefundPolicy>, Omit<RefundPolicy, "id">>(
      `/refund-policies`,
      {
        experience: policy.experience,
        period: policy.period,
        value: policy.value,
        refund_type_code: policy.refund_type_code,
      },
      {
        ...config,
      }
    );

    return data;
  };
}

function putRefundPolicy(http: AxiosInstance) {
  return async (policy: RefundPolicy, options?: Options) => {
    if (!policy.id) {
      throw new Error("Cannot update. Policy ID not provided");
    }

    const { config } = options || {};

    await http.put(`/refund-policies/${policy.id}`, policy, {
      ...config,
    });
  };
}

function deleteRefundPolicy(http: AxiosInstance) {
  return async (policyId: string, options?: Options) => {
    const { config } = options || {};

    await http.delete(`/refund-policies/${policyId}`, {
      ...config,
    });
  };
}

function updateExperienceLanguages(http: AxiosInstance) {
  return async (payload: ExperienceLanguages, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.put<ExperienceLanguages>(
      `/experiences/${payload.experience_id}/experience-languages`,
      payload,
      { ...config, headers: { "accept-version": ACCEPT_VERSION_2_HEADER_VALUE } }
    );
    return { data };
  };
}

function getExperiencePaxes(http: AxiosInstance) {
  return async (experienceId: string, options?: Options) => {
    const { config } = options || {};
    const { data } = await http.get<ExperiencePaxes>(`/experiences/${experienceId}/experience-paxes`, {
      ...config,
      headers: { "accept-version": ACCEPT_VERSION_2_HEADER_VALUE },
    });
    return { data };
  };
}

function updateExperiencePaxes(http: AxiosInstance) {
  return async (payload: ExperiencePaxes, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.put<ExperiencePaxes>(
      `/experiences/${payload.experience_id}/experience-paxes`,
      payload,
      { ...config, headers: { "accept-version": ACCEPT_VERSION_2_HEADER_VALUE } }
    );
    return { data };
  };
}

function getOptionPaxes(http: AxiosInstance) {
  return async (optionId: string, options?: Options) => {
    const { config } = options || {};
    const { data } = await http.get<OptionPaxes>(`/options/${optionId}/option-paxes`, config);
    return { data };
  };
}

function putOptionPaxes(http: AxiosInstance) {
  return async (optionId: string, optionPaxes: OptionPaxes, options?: Options) => {
    const { config } = options || {};
    const { data } = await http.put<OptionPaxes>(`/options/${optionId}/option-paxes`, optionPaxes, config);
    return { data };
  };
}

function getExperienceLanguages(http: AxiosInstance) {
  return async (experienceId: string, options?: Options) => {
    const { config } = options || {};
    const { data } = await http.get<ExperienceLanguages>(`/experiences/${experienceId}/experience-languages`, {
      ...config,
      headers: { "accept-version": ACCEPT_VERSION_2_HEADER_VALUE },
    });
    return { data };
  };
}

function getAllotments(http: AxiosInstance) {
  return async (experienceId: string, options?: Options) => {
    const { config } = options || {};
    const { data } = await http.get<Allotment[]>(`/allotments`, {
      ...config,
      params: {
        experience: experienceId,
      },
      headers: { "accept-version": ACCEPT_VERSION_2_HEADER_VALUE },
    });
    return { data };
  };
}

function createAllotment(http: AxiosInstance) {
  return async (allotment: Allotment) => {
    const { data, headers } = await http.post<Allotment>(`/allotments`, allotment);
    return { data, headers };
  };
}

function updateAllotment(http: AxiosInstance) {
  return async (allotment: Allotment) => {
    if (!allotment.id) {
      throw new Error("the Allotment you are updating has an invalid id");
    }
    const { data } = await http.put(`/allotments/${allotment.id}`, allotment);
    return { data };
  };
}

function deleteAllotment(http: AxiosInstance) {
  return async (id: string) => {
    return await http.delete(`/allotments/${id}`);
  };
}

function getInternalPricings(http: AxiosInstance) {
  return async (optionIds: string[], options?: Options) => {
    const { config } = options || {};
    const { data } = await http.get<InternalPricing[]>(`/internal-product/pricings`, {
      params: {
        filters: emit(builder.in("option_id", optionIds)),
      },
      ...config,
    });
    return { data };
  };
}

function postInternalProductPricing(http: AxiosInstance) {
  return async (internalProductPricing: InternalPricing) => {
    const { data, headers } = await http.post<InternalPricing>(`/internal-product/pricings`, internalProductPricing);
    return { data, headers };
  };
}

function putInternalProductPricing(http: AxiosInstance) {
  return async (internalProductPricing: InternalPricing) => {
    if (!internalProductPricing.id) {
      throw new Error("the InternalPricing you are updating has an invalid id");
    }
    const { data } = await http.put(`/internal-product/pricings/${internalProductPricing.id}`, internalProductPricing);
    return { data };
  };
}

function deleteInternalProductPricing(http: AxiosInstance) {
  return async (id: string) => {
    return await http.delete(`/internal-product/pricings/${id}`);
  };
}

/**
 * Offer Service interface
 * @returns _axiosInstance - Original axios instance, to be used only for internal purpose
 * @returns getAllOptions - Request all the available options
 * @returns getExperienceOptions - Request all the available options for a given experience ID
 * @returns createExperience - Creates an experience in the offer service
 * @returns getExperience - Gets an experience in the offer service
 * @returns postOption - Creates a single option
 * @returns getOption - Request a single option data by its ID
 * @returns putOption - Update a single option data by its ID
 * @returns deleteOption - Delete a single option data by its ID
 */
export function useOfferServiceApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.OFFER_SERVICE_BASE_URL,
      headers: {
        Accept: "application/json",
      },
    },
    auth,
  });

  async function createExperience(experienceId: string, payload: Partial<Experience>, options?: Options) {
    const { config } = options || {};
    const body: Experience = {
      type: ExperienceType.CALENDAR_TIMESLOTS,
      confirmation_time: INSTANT_DURATION,
      cutoff_time: INSTANT_DURATION,
      supplier: runtimeConfig.public.SUPPLIER_ID,
      state: "DRAFT",
      currency: "EUR",
      uuid: experienceId,
      ...payload,
    };

    await axiosInstance.post<Experience>("/experiences", body, config);

    return { data: body };
  }

  function getExperience(experienceId: string, options?: Options) {
    const { config } = options || {};
    return axiosInstance.get<Experience>(`/experiences/${experienceId}`, config);
  }

  function updateExperience(experienceId: string, data: Partial<Experience>, options?: Options) {
    const { config } = options || {};

    return axiosInstance.put<Experience>(`/experiences/${experienceId}`, data, config);
  }

  function publishExperience(experienceId: string, options?: Options) {
    const { config } = options || {};

    return axiosInstance.post<void>(`/experiences/${experienceId}/publish`, {}, config);
  }

  function deleteExperience(experienceId: string, options?: Options) {
    const { config } = options || {};

    return axiosInstance.delete<Experience>(`/experiences/${experienceId}`, config);
  }

  function getExperienceOptions(experienceId: string, options?: Options) {
    const { config } = options || {};
    return axiosInstance.get<Option[]>("/options", {
      ...config,
      params: {
        experience: experienceId,
        ...config?.params,
      },
    });
  }

  function getAllOptions(options?: Options) {
    const { config } = options || {};
    return axiosInstance.get<Option[]>("/options", config);
  }

  function getOptionPricing(optionId: string, options?: Options) {
    const { config } = options || {};
    return axiosInstance.get<Pricing[]>(`/pricings`, {
      ...config,
      params: {
        option: optionId,
        ...config?.params,
      },
    });
  }

  function postOption(experienceId: string, data: Omit<Option, "experience" | "id">, options?: Options) {
    const { config } = options || {};

    return axiosInstance.post<Option>(
      "/options",
      {
        ...data,
        experience: experienceId,
      },
      config
    );
  }

  function getOption(optionId: string, options?: Options) {
    const { config } = options || {};

    return axiosInstance.get<Option>(`/options/${optionId}`, config);
  }

  function getOptions(experienceId: string, options?: Options) {
    const { config } = options || {};

    return axiosInstance.get<Option[]>(`/options`, {
      params: {
        experience: experienceId,
      },
      ...config,
    });
  }

  function putOption(optionId: string, data: Option, options?: Options) {
    const { config } = options || {};
    return axiosInstance.put<Option>(`/options/${optionId}`, data, config);
  }

  function deleteOption(optionId: string, options?: Options) {
    const { config } = options || {};
    return axiosInstance.delete<Option>(`/options/${optionId}`, config);
  }

  return {
    _axiosInstance: axiosInstance,
    createExperience,
    getExperience,
    updateExperience,
    publishExperience,
    deleteExperience,
    getExperienceOptions,
    getAllOptions,
    getOption,
    getOptions,
    getOptionPricing,
    postOption,
    putOption,
    deleteOption,
    getPricings: getPricings(axiosInstance),
    deletePricing: deletePricing(axiosInstance),
    createPricing: createPricing(axiosInstance),
    updatePricing: updatePricing(axiosInstance),
    getAvailabilities: getAvailabilities(axiosInstance),
    createAvailability: createAvailability(axiosInstance),
    updateAvailability: updateAvailability(axiosInstance),
    deleteAvailability: deleteAvailability(axiosInstance),
    getRefundPolicies: getRefundPolicies(axiosInstance),
    postRefundPolicy: postRefundPolicy(axiosInstance),
    putRefundPolicy: putRefundPolicy(axiosInstance),
    deleteRefundPolicy: deleteRefundPolicy(axiosInstance),
    updateExperienceLanguages: updateExperienceLanguages(axiosInstance),
    getExperiencePaxes: getExperiencePaxes(axiosInstance),
    updateExperiencePaxes: updateExperiencePaxes(axiosInstance),
    getOptionPaxes: getOptionPaxes(axiosInstance),
    putOptionPaxes: putOptionPaxes(axiosInstance),
    getExperienceLanguages: getExperienceLanguages(axiosInstance),
    getAllotments: getAllotments(axiosInstance),
    createAllotment: createAllotment(axiosInstance),
    updateAllotment: updateAllotment(axiosInstance),
    deleteAllotment: deleteAllotment(axiosInstance),
    getInternalPricings: getInternalPricings(axiosInstance),
    postInternalProductPricing: postInternalProductPricing(axiosInstance),
    putInternalProductPricing: putInternalProductPricing(axiosInstance),
    deleteInternalProductPricing: deleteInternalProductPricing(axiosInstance),
  };
}
