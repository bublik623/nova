import { AsxExperience, ModalityCodes, RawAsterixAdapterInformation } from "@/types/generated/ExperienceRawServiceApi";
import { useExperienceRawApi } from "@/composables/useExperienceRawApi";

export function useAsterixServiceAndModalitiesDataSource() {
  const experienceRawApi = useExperienceRawApi();

  async function fetchServices(
    servicesAndRelatedModalities: Array<RawAsterixAdapterInformation>
  ): Promise<Array<AsxExperience>> {
    const resultPromises = servicesAndRelatedModalities
      .map((serviceAndRelatedModalities) => serviceAndRelatedModalities.code!)
      .map(fetchService);
    const results = await Promise.all(resultPromises);

    return results.filter((service) => !!service) as Array<AsxExperience>;
  }

  async function fetchService(code: string) {
    const matchingServices = await searchServices(code, 0, 50);
    const correctService = matchingServices.find((service) => service.code === code);

    if (!correctService) {
      console.log(`could not find Asterix Service with code '${code}'`);
    }

    return correctService;
  }

  async function searchServices(query: string, pageIndex: number, pageSize: number): Promise<Array<AsxExperience>> {
    const offset = pageIndex * pageSize;
    const limit = pageSize;
    const result = await experienceRawApi.getAsterixServices(query, offset, limit);

    return result.data;
  }

  async function fetchModalities(
    servicesAndRelatedModalities: Array<RawAsterixAdapterInformation>
  ): Promise<Array<ModalityCodes>> {
    const modalitiesPromises = servicesAndRelatedModalities.map(async (item) => {
      const modalities = await searchModalities(item.code!, "", 0, 100);
      return modalities.filter((modality) => item.modality_codes?.includes(modality.code!));
    });

    const modalities = await Promise.all(modalitiesPromises);

    return modalities.flat();
  }

  async function searchModalities(
    serviceCode: string,
    query: string,
    pageIndex: number,
    pageSize: number
  ): Promise<Array<ModalityCodes>> {
    const offset = pageIndex * pageSize;
    const limit = pageSize;
    const result = await experienceRawApi.getAsterixModalities(serviceCode, offset, limit);

    const filterRegex = new RegExp(query, "i");
    return result.data.filter(
      (modality) => filterRegex.test(modality.code!) || filterRegex.test(modality.default_name!)
    );
  }

  return {
    fetchServices,
    searchServices,
    fetchModalities,
    searchModalities,
  };
}
