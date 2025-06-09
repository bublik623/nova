import { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { Currency, Supplier } from "@/types/generated/ContractMasterDataApi";

interface Options {
  config: AxiosRequestConfig;
}

function getSuppliers(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<Supplier[]>(`/suppliers`, config);

    return { data };
  };
}

function getSupplierById(http: AxiosInstance) {
  return async (id: string, options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<Supplier>(`/suppliers/${id}`, config);

    return { data };
  };
}

function createSupplier(http: AxiosInstance) {
  return async (supplier: Supplier, options?: Options) => {
    const { config } = options || {};

    const body = {
      ...supplier,
    };

    const { data } = await http.post<Supplier>(`/suppliers`, body, config);

    return { data };
  };
}

function getCurrencies(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options || {};

    const { data } = await http.get<Currency[]>(`/currencies`, config);

    return { data };
  };
}

/**
 * Contract Master Data Api
 *
 * openapi file: contract-master-data-openapi.yaml
 */
export function useContractMasterDataApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.CONTRACT_MASTER_DATA_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.contract-master-data-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getSuppliers: getSuppliers(axiosInstance),
    createSupplier: createSupplier(axiosInstance),
    getSupplierById: getSupplierById(axiosInstance),
    getCurrencies: getCurrencies(axiosInstance),
  };
}

export type UseContractMasterDataApi = ReturnType<typeof useContractMasterDataApi>;
