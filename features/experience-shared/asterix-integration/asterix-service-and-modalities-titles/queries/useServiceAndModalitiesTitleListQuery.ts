import { useQuery } from "@tanstack/vue-query";
import { ServiceAndModalitiesTitleListValue } from "../types/service-and-modalities-title-list-value";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";
import { AsxExperience, ModalityCodes } from "@/types/generated/ExperienceRawServiceApi";

export const SERVICE_AND_MODALITIES_TITLES_LIST_QUERY_KEY = "SERVICE_AND_MODALITIES_TITLES_LIST_QUERY_KEY";

type DataFromApi = { services: Array<AsxExperience>; modalities: Map<string, Array<ModalityCodes>> };

/**
 * This query fetches the titles of required Services and related Modalities used in Asterix (through experience-raw apis).
 * @param serviceCodes a (reactive) list of codesd that identifies the services for which you want to retrieve the data.
 * @returns the query that reacts to the given list of code.
 */
export function useServiceAndModalitiesTitleListQuery(serviceCodes: Ref<Array<string>>) {
  const experienceRawApi = useExperienceRawApi();

  return useQuery({
    queryKey: [SERVICE_AND_MODALITIES_TITLES_LIST_QUERY_KEY, serviceCodes],
    queryFn: async () => {
      const servicesPromise = Promise.all(serviceCodes.value.map(fetchService));
      const modalitiesPromise = Promise.all(serviceCodes.value.map(fetchModalities));

      const [services, modalities] = await Promise.all([servicesPromise, modalitiesPromise]);

      return {
        services: services.filter((service) => !!service)!,
        modalities: new Map(modalities),
      };
    },
    select: mapToParentChild,
  });

  async function fetchService(serviceCode: string): Promise<AsxExperience | undefined> {
    const { data: matchingServices } = await experienceRawApi.getAsterixServices(serviceCode, 0, 100);
    return matchingServices.find((service) => service.code === serviceCode);
  }

  async function fetchModalities(serviceCode: string): Promise<[string, Array<ModalityCodes>]> {
    const { data: modalities } = await experienceRawApi.getAsterixModalities(serviceCode, 0, 100);
    return [serviceCode, modalities];
  }

  function mapToParentChild({ services, modalities }: DataFromApi): ServiceAndModalitiesTitleListValue {
    return services.map((service) => ({
      serviceCode: service.code!,
      title: service.default_name ?? "",
      modalities:
        modalities.get(service.code!)?.map((modality) => ({
          modalityCode: modality.code!,
          title: modality.default_name ?? "",
        })) ?? [],
    }));
  }
}
