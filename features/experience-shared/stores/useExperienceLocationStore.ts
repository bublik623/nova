import { FormField } from "@/types/Form";
import {
  ExperienceAdditionalCities,
  ExperienceLocation,
  ExperienceVenues,
} from "@/types/generated/MetadataExperiencesApi";
import { defineStore } from "pinia";
import { useMetadataExperienceApi } from "@/composables/useMetadataExperienceApi";
import { useMasterData } from "@/stores/master-data";
import { City as GeoCity } from "@/types/generated/GeoMasterDataApi";
import { isEmpty } from "lodash";
import { Location } from "@/types/generated/ExperienceRawServiceApi";

export interface AddressFieldValues {
  latitude: number;
  longitude: number;
  direction: string;
  postalCode: string;
}

export type LocationFields = {
  city: FormField<GeoCity | null>;
  address: FormField<AddressFieldValues>;
  additionalCities: FormField<GeoCity[]>;
  venues: FormField<string[]>;
};

const getEmptyAddress = (): AddressFieldValues => {
  return {
    latitude: 0,
    longitude: 0,
    direction: "",
    postalCode: "",
  };
};

export type ExperienceLocationData = Omit<ExperienceLocation, "experience_id">;

export const useExperienceLocationStore = defineStore("useExperienceLocationStore", () => {
  const masterDataStore = useMasterData();
  const metadataService = useMetadataExperienceApi();

  const isLoading = ref(false);
  const isSaving = ref(false);
  const locationData = ref<ExperienceLocation | undefined>();
  const locationId = ref<string>();
  const additionalCitiesId = ref<string>();
  const venuesId = ref<string>();

  const fields = ref<LocationFields>({
    city: {
      value: null,
      required: true,
      category: "experience_location",
    },
    address: {
      value: getEmptyAddress(),
      required: false,
      category: "experience_location",
      validator: (values) => values.direction.length > 0 && values.latitude > 0 && values.longitude > 0,
    },
    additionalCities: {
      value: [],
      required: false,
      category: "experience_location",
    },
    venues: {
      value: [],
      required: false,
      category: "experience_location",
    },
  });

  const isFormValid = computed(() => {
    return !!fields.value.city.value;
  });

  const hasCoordinates = computed(() => {
    const address = fields.value.address.value;
    return address.latitude > 0 && address.longitude > 0;
  });

  const cityCodes = computed(() => {
    let codes = [];
    if (fields.value.city.value?.code) {
      codes.push(fields.value.city.value.code);
    }

    if (fields.value.additionalCities.value.length) {
      const additionalCitiesCodes = fields.value.additionalCities.value.map((additionalCity) => additionalCity.code);
      codes = codes.concat(additionalCitiesCodes);
    }
    return codes;
  });

  function initLocationFields(data?: Location) {
    if (isEmpty(data)) {
      return;
    }

    initCityField(data);
    initAddressField(data);
  }

  function initCityField(data: Location) {
    const cities = masterDataStore.geoCities;

    const selectedOption = cities.find((option) => option.code === data.address!.city);

    if (!selectedOption) {
      return;
    }

    fields.value.city.value = selectedOption;
  }

  function initAddressField(data: Location) {
    if (!data.latitude || !data.longitude || !data.address?.direction) {
      return;
    }

    fields.value.address.value = {
      direction: data.address.direction,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      postalCode: data.address?.postal_code || "",
    };
  }

  function initAdditionalCitiesField(cityCodes: string[] | undefined) {
    if (!cityCodes?.length) {
      return;
    }

    fields.value.additionalCities.value = cityCodes
      .map((cityCode: string) => masterDataStore.geoCities.find((city) => city.code === cityCode))
      .filter((city): city is GeoCity => city !== undefined);
  }

  function initVenuesField(venueCodes: string[]) {
    fields.value.venues.value = venueCodes ?? [];
  }

  const resetAddressField = () => {
    fields.value.address.value = getEmptyAddress();
  };

  const resetFields = () => {
    fields.value.city.value = null;
    resetAddressField();
    fields.value.additionalCities.value = [];
    fields.value.venues.value = [];
  };

  function getLocationPayload(): ExperienceLocationData | undefined {
    const address = fields.value.address.value;
    const city = fields.value.city.value;
    if (!city) {
      return;
    }
    const selectedCountry = masterDataStore.getCountryByCode(city.country_code_alpha2);

    return {
      name: city.name,
      ...(address.latitude && {
        latitude: address.latitude.toString(),
        longitude: address.longitude.toString(),
      }),
      address: {
        city: city.code,
        country: selectedCountry.name,
        ...(address.postalCode && { postal_code: address.postalCode }),
        ...(address.direction && { direction: address.direction }),
      },
    };
  }

  function getAdditionalCitiesPayload(): string[] {
    return fields.value.additionalCities.value.map((city) => city.code);
  }

  function getVenuesPayload(): string[] {
    return fields.value.venues.value;
  }

  const loadLocation = async (experienceId: string) => {
    resetFields();
    isLoading.value = true;

    try {
      const { data } = await metadataService.getLocation(experienceId);
      locationData.value = data;
      locationId.value = data?.id;

      if (data) {
        initLocationFields(data);
      }
    } catch (error) {
      console.error("Error loading location:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const loadAdditionalCities = async (experienceId: string) => {
    fields.value.additionalCities.value = [];
    isLoading.value = true;

    try {
      const { data } = await metadataService.getAdditionalCitiesById(experienceId);
      if (data) {
        initAdditionalCitiesField(data?.additional_cities);
        additionalCitiesId.value = data.id;
      }
    } catch (error) {
      console.error("Error loading additional cities:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const loadVenues = async (experienceId: string) => {
    isLoading.value = true;

    try {
      const { data } = await metadataService.getVenuesById(experienceId);
      if (data) {
        initVenuesField(data.venues);
        venuesId.value = data.id;
      }
    } catch (error) {
      console.error("Error loading venues:", error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete the location data
   */
  const deleteLocation = async () => {
    try {
      if (locationId.value) {
        await metadataService.deleteLocation(locationId.value);
        // Reset the relationId since the location is deleted
        locationId.value = undefined;
        resetAddressField();
      }
    } catch (error) {
      console.error("Error deleting location data:", error);
    }
  };

  const deleteAdditionalCities = async () => {
    try {
      if (additionalCitiesId.value) {
        await metadataService.deleteAdditionalCities(additionalCitiesId.value);
        additionalCitiesId.value = undefined;
        resetAddressField();
      }
    } catch (error) {
      console.error("Error deleting additional cities:", error);
    }
  };

  const deleteVenues = async () => {
    try {
      if (venuesId.value) {
        await metadataService.deleteVenues(venuesId.value);
        venuesId.value = undefined;
      }
    } catch (error) {
      console.error("Error deleting venues:", error);
    }
  };

  /**
   * Save or update the location data based on the existence of relationId
   */
  const createOrUpdateLocationData = async (experienceId: string) => {
    try {
      const locationPayload = getLocationPayload();
      if (!locationPayload) {
        return;
      }
      const payload: ExperienceLocation = {
        experience_id: experienceId,
        ...locationPayload,
      };

      if (locationId.value) {
        await metadataService.updateLocation(locationId.value, payload);
      } else {
        const { data } = await metadataService.createLocation(payload);
        locationId.value = data;
      }
    } catch (error) {
      console.error("Error saving/updating location data:", error);
    }
  };

  const createOrUpdateAdditionalCities = async (experienceId: string) => {
    try {
      const payload: ExperienceAdditionalCities = {
        experience_id: experienceId,
        additional_cities: getAdditionalCitiesPayload(),
      };

      if (additionalCitiesId.value) {
        await metadataService.updateAdditionalCities(experienceId, additionalCitiesId.value, payload);
      } else {
        const { data } = await metadataService.createAdditionalCities(experienceId, payload);
        additionalCitiesId.value = data;
      }
    } catch (error) {
      console.error("Error saving/updating additional cities:", error);
    }
  };

  const createOrUpdateVenues = async (experienceId: string) => {
    try {
      const payload: ExperienceVenues = {
        experience_id: experienceId,
        venues: getVenuesPayload(),
      };

      if (venuesId.value) {
        await metadataService.updateVenues(experienceId, venuesId.value, payload);
      } else {
        const { data } = await metadataService.createVenues(experienceId, payload);
        venuesId.value = data;
      }
    } catch (error) {
      console.error("Error saving/updating venues:", error);
    }
  };

  /**
   * Create or update a location
   */
  const saveLocation = async (experienceId: string) => {
    isSaving.value = true;
    const selectedCity = fields.value.city.value;

    try {
      if (locationData.value && !selectedCity) {
        await deleteLocation();
      } else {
        await createOrUpdateLocationData(experienceId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isSaving.value = false;
    }
  };

  const saveAdditionalCities = async (experienceId: string) => {
    isSaving.value = true;
    const selectedAdditionalCities = fields.value.additionalCities.value;

    try {
      if (additionalCitiesId.value && selectedAdditionalCities.length === 0) {
        await deleteAdditionalCities();
      } else if (selectedAdditionalCities.length > 0) {
        await createOrUpdateAdditionalCities(experienceId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isSaving.value = false;
    }
  };

  const saveVenues = async (experienceId: string) => {
    isSaving.value = true;
    const selectedVenues = fields.value.venues.value;

    try {
      if (venuesId.value && selectedVenues.length === 0) {
        await deleteVenues();
      } else if (selectedVenues.length > 0) {
        await createOrUpdateVenues(experienceId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isSaving.value = false;
    }
  };

  function $reset() {
    isLoading.value = false;
    isSaving.value = false;
    locationData.value = undefined;
    locationId.value = undefined;
    additionalCitiesId.value = undefined;
    venuesId.value = undefined;
    resetFields();
  }

  return {
    initLocationFields,
    initAdditionalCitiesField,
    initVenuesField,
    isLoading,
    isSaving,
    isFormValid,
    locationId,
    hasCoordinates,
    fields,
    cityCodes,
    loadLocation,
    loadAdditionalCities,
    loadVenues,
    saveLocation,
    saveAdditionalCities,
    saveVenues,
    resetAddressField,
    getLocationPayload,
    getAdditionalCitiesPayload,
    getVenuesPayload,
    $reset,
  };
});
