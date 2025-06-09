import { useAuthStore } from "@/features/auth/useAuthStore";
import { City, Country, Venue } from "@/types/generated/GeoMasterDataApi";
import { createHttpInstance } from "../utils/http/http";
import { emit } from "@rsql/emitter";
import { AxiosInstance } from "axios";
import builder from "@rsql/builder";

function getVenuesByCityCode(http: AxiosInstance) {
  return async (cityCodes: string[]) => {
    const { data } = await http.get<Venue[]>(`/venues`, {
      params: {
        filters: emit(builder.in("city", cityCodes)),
      },
    });

    return { data };
  };
}

export function useGeoMasterDataApi() {
  const runtimeConfig = useRuntimeConfig();
  const auth = useAuthStore();

  const axiosInstance = createHttpInstance({
    config: {
      baseURL: runtimeConfig.public.GEO_MASTER_DATA_BASE_URL,
      headers: {
        "accept-version": "vnd.geo-master-data-offer-service.v1",
      },
      params: { language_code: "en" },
    },
    auth,
  });

  function getCities() {
    return axiosInstance.get<City[]>("cities");
  }

  function getCountries() {
    return axiosInstance.get<Country[]>("countries");
  }

  return {
    _axiosInstance: axiosInstance,
    getVenuesByCityCode: getVenuesByCityCode(axiosInstance),
    getCities,
    getCountries,
  };
}
