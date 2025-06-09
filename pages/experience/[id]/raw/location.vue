<template>
  <RawLocationForm
    v-model="locationValuesModel"
    :masterdata="{ cities, venuesList, selectedVenueList }"
    :has-coordinates="hasCoordinates"
    :required-fields="['location.city']"
    :options="{
      isReadonly,
      productType: experience.data.product_type,
      statusCode: experience.data.status_code,
    }"
    @handle-direction-text-change="handleDirectionTextChange"
    @handle-remove-venue="handleRemoveVenue"
    @handle-select-place="handleSelectPlace"
  />
</template>

<script setup lang="ts">
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import { storeToRefs } from "pinia";
import { useExperienceRaw } from "@/stores/experience-raw";
import { SelectedPlace } from "@/features/experience-calendar/components/FieldPlaceSearch.vue";
import { useMasterData } from "@/stores/master-data";
import { RawPageProps } from "@/features/experience-raw/types/pages";
import { cloneDeep, isEqual } from "lodash";
import { Venue } from "@/types/generated/GeoMasterDataApi";
import RawLocationForm, { RawLocationValues } from "@/features/experience-raw/forms/RawLocationForm.vue";
import { useLegacyStores } from "@/features/experience-raw/stores/useLegacyStores";

defineProps<RawPageProps>();

const locationStore = useExperienceLocationStore();
const experienceRawStore = useExperienceRaw();
const experience = computed(() => experienceRawStore.rawContents[id]);

const legacyStore = useLegacyStores();

const { fields, hasCoordinates, cityCodes } = storeToRefs(locationStore);

const { params } = useRoute();
const id = params.id as string;

const masterdataStore = useMasterData();
const cities = masterdataStore.geoCities;

const locationValuesModel = computed<RawLocationValues>({
  get() {
    return {
      city: fields.value.city.value,
      additionalCities: fields.value.additionalCities.value,
      venues: fields.value.venues.value,
      address: fields.value.address.value,
      meetingPointDetails: experience.value.fields.meeting_point_details.value,
    };
  },
  set(value) {
    fields.value.city.value = value.city;
    fields.value.additionalCities.value = value.additionalCities;
    fields.value.venues.value = value.venues;
    fields.value.address.value = value.address;
    experience.value.fields.meeting_point_details.value = value.meetingPointDetails;
  },
});

const { data: venuesList, refresh: refreshVenues } = await useLazyAsyncData<Venue[]>(
  `load-venues-raw-${cityCodes.value.join(",")}`,
  async () => {
    if (cityCodes.value.length === 0) {
      return [];
    }
    return await masterdataStore.getVenuesByCityCode(cityCodes.value);
  },
  { default: () => [] }
);

const selectedVenueList = computed<Venue[]>(() => {
  return fields.value.venues.value
    .map((venueCode) => venuesList.value?.find((v) => v.code === venueCode))
    .filter((venue): venue is Venue => venue !== undefined);
});

function handleRemoveVenue(venue: Venue) {
  fields.value.venues.value = fields.value.venues.value.filter((v) => v !== venue.code);
}

const venuesInSelectedCities = computed<string[]>(() => {
  return fields.value.venues.value.filter((venueCode) =>
    venuesList.value.some((venue) => venue.code === venueCode && cityCodes.value.includes(venue.city))
  );
});

function removeVenuesOutsideSelectedCities() {
  fields.value.venues.value = venuesInSelectedCities.value;
}

watch(cityCodes, async (newValue, oldValue) => {
  if (isEqual(newValue, oldValue)) {
    return;
  }

  removeVenuesOutsideSelectedCities();
  await refreshVenues();
});

const experienceRawFieldsInitialValue = cloneDeep(experience.value.fields);
const locationFieldsInitialValue = cloneDeep(locationStore.fields);

watch(
  // watch all the stores used in the page
  [() => experience.value.fields, () => locationStore.fields],
  ([currentExperienceRawFields, currentLocationFields]) => {
    const anyChangeInExperienceRawFields = !isEqual(currentExperienceRawFields, experienceRawFieldsInitialValue);
    const anyChangeInLocationFields = !isEqual(currentLocationFields, locationFieldsInitialValue);

    if (anyChangeInExperienceRawFields || anyChangeInLocationFields) {
      legacyStore.hasChanges = true;
    }
  },
  {
    deep: true,
  }
);

function handleDirectionTextChange(value: string) {
  if (!value.length) {
    locationStore.resetAddressField();
  }
}

async function handleSelectPlace(selected: SelectedPlace) {
  fields.value.address.value = {
    direction: selected.address,
    latitude: selected.lat,
    longitude: selected.lng,
    postalCode: selected.postalCode,
  };
}
</script>
