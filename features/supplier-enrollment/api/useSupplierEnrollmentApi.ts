import { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createHttpInstance } from "@/features/core-shared/utils/http/http";
import { Supplier } from "@/types/generated/ContractMasterDataApi";

interface Options {
  config: AxiosRequestConfig;
}

function getActiveSuppliers(http: AxiosInstance) {
  return async (options?: Options) => {
    const { config } = options || {};
    const { data } = await http.get<Supplier[]>(`/suppliers/active`, config);
    return { data };
  };
}

/**
 * Supplier Enrollment Api
 *
 * openapi file: supplier-enrollment-openapi.yaml
 */
export function useSupplierEnrollmentApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.SUPPLIER_ENROLLMENT_SERVICE_BASE_URL,
      headers: { "accept-version": "vnd.supplier-enrollment-offer-service.v1" },
    },
    auth,
  });

  return {
    _axiosInstance: axiosInstance,
    getActiveSuppliers: getActiveSuppliers(axiosInstance),
  };
}

export type UseSupplierEnrollmentApi = ReturnType<typeof useSupplierEnrollmentApi>;
