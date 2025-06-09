import {
  AsxExperience,
  ModalityCodes,
  RawAsterixAdapterInformation,
} from "@/types/generated/ExperienceRawServiceApi.js";
import { useAsterixServiceAndModalitiesDataSource } from "../lib/asterix-service-and-modalities-datasource.js";
import { defineStore } from "pinia";
import { useNotifications } from "@/stores/notifications";
import { useLogger } from "@/features/core-shared/composables/useLogger";

export type ServiceAndRelatedModalities = {
  id: string;
  service?: AsxExperience;
  modalities: Array<ModalityCodes>;
};

export type AvailableService = AsxExperience & { can_be_selected: boolean };

export const useRawServiceAndModalitiesStore = defineStore("rawServiceAndModalities", () => {
  const dataSource = useAsterixServiceAndModalitiesDataSource();
  const notificationStore = useNotifications();
  const { logError } = useLogger();

  const experienceReferenceCode = ref<string>();
  const selectedServicesAndModalities = ref<Array<ServiceAndRelatedModalities>>([]);
  const servicesAndModalitiesCodes = computed<Array<RawAsterixAdapterInformation>>(() => {
    return selectedServicesAndModalities.value.map((entry) => ({
      code: entry.service?.code,
      modality_codes: entry.modalities.map((modality) => modality.code!),
    }));
  });

  const selectedServicesCodes = computed(() =>
    selectedServicesAndModalities.value
      .map((selectedServiceAndModalities) => selectedServiceAndModalities.service?.code)
      .filter((selectedServiceCode) => !!selectedServiceCode)
  );

  async function initSelectedServicesAndModalities(
    referenceCode: string,
    servicesAndModalitiesCodes: Array<RawAsterixAdapterInformation>
  ) {
    try {
      const [services, modalities] = await Promise.all([
        dataSource.fetchServices(servicesAndModalitiesCodes),
        dataSource.fetchModalities(servicesAndModalitiesCodes),
      ]);

      experienceReferenceCode.value = referenceCode;
      selectedServicesAndModalities.value = servicesAndModalitiesCodes.map((serviceAndModalitiesCodes) => ({
        id: window.crypto.randomUUID(),
        service: services.find((service) => service.code === serviceAndModalitiesCodes.code),
        modalities: modalities.filter((modality) => serviceAndModalitiesCodes.modality_codes?.includes(modality.code!)),
      }));
    } catch (error) {
      logError("load-raw-asterix-service-and-modalities", error);
      notificationStore.addNotification({ theme: "error", message: "notifications.error.fetching.data" });
    }
  }

  function addNew() {
    selectedServicesAndModalities.value = [
      ...selectedServicesAndModalities.value,
      { id: window.crypto.randomUUID(), service: undefined, modalities: [] },
    ];
  }

  function remove(id: string) {
    const serviceAndRelatedModalities = getSelectedServiceOrThrowError(id);
    const indexOfServiceAndRelatedModalities = selectedServicesAndModalities.value.indexOf(serviceAndRelatedModalities);

    selectedServicesAndModalities.value.splice(indexOfServiceAndRelatedModalities, 1);
  }

  async function getAvailableServices(id: string, query: string): Promise<Array<AvailableService>> {
    const serviceAndRelatedModalities = getSelectedServiceOrThrowError(id);
    const selectedService = serviceAndRelatedModalities.service;

    try {
      const matchingServices = await dataSource.searchServices(query, 0, 100);
      const alreadySelectedServices = selectedServicesCodes.value;

      return matchingServices.map((service) => {
        const isServiceSelectedForTheGivenEntry = service.code === selectedService?.code;
        const isServiceSelectedForADifferentEntry =
          !isServiceSelectedForTheGivenEntry && alreadySelectedServices.includes(service.code);
        const isServiceSelectedOnADifferentExperience =
          !isServiceSelectedForTheGivenEntry &&
          !isServiceSelectedForADifferentEntry &&
          !!service.reference_code &&
          service.reference_code !== experienceReferenceCode.value;
        const canBeSelected =
          isServiceSelectedForTheGivenEntry ||
          (!isServiceSelectedForADifferentEntry && !isServiceSelectedOnADifferentExperience);

        return {
          ...service,
          reference_code: isServiceSelectedForADifferentEntry ? experienceReferenceCode.value : service.reference_code,
          can_be_selected: canBeSelected,
        };
      });
    } catch (error) {
      logError("load-raw-asterix-service-and-modalities", error);
      notificationStore.addNotification({ theme: "error", message: "notifications.error.fetching.data" });
      return [];
    }
  }

  function setSelectedService(id: string, service: AsxExperience) {
    const serviceAndRelatedModalities = getSelectedServiceOrThrowError(id);
    const alreadySelectedService = serviceAndRelatedModalities.service;

    if (alreadySelectedService && alreadySelectedService.code !== service.code) {
      removeAllModalities(id);
    }

    serviceAndRelatedModalities.service = service;
  }

  async function getAvailableModalities(id: string, query: string) {
    const service = getSelectedServiceOrThrowError(id).service;

    if (!service?.code) {
      throw new Error("can't get available modalities when a service is not set");
    }

    try {
      return await dataSource.searchModalities(service.code, query, 0, 100);
    } catch (error) {
      logError("load-raw-asterix-service-and-modalities", error);
      notificationStore.addNotification({ theme: "error", message: "notifications.error.fetching.data" });
    }
  }

  function getSelectedModalities(id: string) {
    const serviceAndModalities = getSelectedServiceOrThrowError(id);
    return serviceAndModalities?.modalities ?? [];
  }

  function hasAnySelectedModality(id: string) {
    return getSelectedModalities(id).length > 0;
  }

  function toggleModalitySelection(id: string, modality: ModalityCodes) {
    const serviceAndRelatedModalities = getSelectedServiceOrThrowError(id);

    const modalityIsAlreadySelected = serviceAndRelatedModalities.modalities.includes(modality);

    if (modalityIsAlreadySelected) {
      removeModality(id, modality);
    } else {
      serviceAndRelatedModalities.modalities.push(modality);
    }
  }

  function removeModality(id: string, modality: ModalityCodes) {
    const serviceAndRelatedModalities = getSelectedServiceOrThrowError(id);

    const indexOfModality = serviceAndRelatedModalities.modalities.indexOf(modality);

    if (indexOfModality > -1) {
      serviceAndRelatedModalities.modalities.splice(indexOfModality, 1);
    }
  }

  function removeAllModalities(id: string) {
    const serviceAndRelatedModalities = getSelectedServiceOrThrowError(id);

    serviceAndRelatedModalities.modalities = [];
  }

  function getSelectedServiceOrThrowError(id: string) {
    const serviceAndRelatedModalities = selectedServicesAndModalities.value.find(
      (serviceAndModalities) => serviceAndModalities.id === id
    );

    if (!serviceAndRelatedModalities) {
      throw new Error(`can't find service and related modalities matching the given id: '${id}'`);
    }

    return serviceAndRelatedModalities;
  }

  return {
    experienceReferenceCode,
    selectedServicesAndModalities,
    servicesAndModalitiesCodes,
    initSelectedServicesAndModalities,
    getSelectedServiceOrThrowError,
    addNew,
    remove,
    getAvailableServices,
    setSelectedService,
    getAvailableModalities,
    hasAnySelectedModality,
    toggleModalitySelection,
    removeModality,
    removeAllModalities,
  };
});
