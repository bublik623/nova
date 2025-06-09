<template>
  <DocumentFormSection id="location.city" :required="requiredFields.includes('location.city')" :slot-max-width="400">
    <FieldCity v-model="model.city" :options="masterdata.cities" :readonly="options.isReadonly" />
  </DocumentFormSection>

  <DocumentFormSection id="location.additional-cities" class="max-w-[640px]">
    <FieldAdditionalCities
      v-model="model.additionalCities"
      :options="masterdata.cities"
      :disabled="options.isReadonly"
    />
    <FieldAdditionalCitiesList v-model="model.additionalCities" class="mt-4" :disabled="options.isReadonly" />
  </DocumentFormSection>

  <DocumentFormSection id="location.venues">
    <FieldVenues v-model="model.venues" :options="masterdata.venuesList" :disabled="options.isReadonly" />
    <FieldVenuesList
      :items="masterdata.selectedVenueList"
      class="mt-4"
      :disabled="options.isReadonly"
      @remove="($event) => emits('handleRemoveVenue', $event)"
    />
  </DocumentFormSection>

  <DocumentFormSection id="location.address">
    <FieldPlaceSearch
      :model-value="model.address.direction"
      field-id="field-address"
      :placeholder="$t('common.field.address.placeholder')"
      :readonly="options.isReadonly"
      @update:model-value="($event) => $emit('handleDirectionTextChange', $event)"
      @select="($event) => $emit('handleSelectPlace', $event)"
    />

    <div v-if="hasCoordinates" class="mt-4" style="height: 240px">
      <FieldMap map-id="field-map" :center="{ lat: model.address.latitude, lng: model.address.longitude }"></FieldMap>
    </div>
  </DocumentFormSection>

  <DocumentFormSection id="location.meeting-point">
    <NovaTextEditor
      v-model="model.meetingPointDetails"
      :readonly="options.isReadonly"
      :disabled="isMeetingPointDisabledDuringCuration"
      :placeholder="$t('experience.description.editor.placeholder')"
      data-testid="location-meeting-point"
    />
  </DocumentFormSection>
</template>

<script setup lang="ts">
import FieldCity from "@/features/experience-shared/components/FieldCity.vue";
import FieldAdditionalCities from "@/features/experience-shared/components/FieldAdditionalCities.vue";
import FieldAdditionalCitiesList from "@/features/experience-shared/components/FieldAdditionalCitiesList.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import FieldPlaceSearch, { SelectedPlace } from "@/features/experience-calendar/components/FieldPlaceSearch.vue";
import FieldMap from "@/features/experience-calendar/components/FieldMap.vue";
import { isDisabledDuringCuration } from "@/features/experience-raw/utils/experience-raw-utils";
import FieldVenues from "@/features/experience-shared/components/FieldVenues.vue";
import FieldVenuesList from "@/features/experience-shared/components/FieldVenuesList.vue";
import { City, Venue } from "@/types/generated/GeoMasterDataApi";
import { ExperienceRawOptions } from "../types/experience";
import { useVModel } from "@vueuse/core";

export interface RawLocationValues {
  city: City | null;
  additionalCities: City[];
  venues: string[];
  address: {
    direction: string;
    latitude: number;
    longitude: number;
    postalCode: string;
  };
  meetingPointDetails: string;
}

export interface RawLocationFormProps {
  hasCoordinates: boolean;
  modelValue: RawLocationValues;
  options: ExperienceRawOptions;
  masterdata: {
    cities: City[];
    venuesList: Venue[];
    selectedVenueList: Venue[];
  };
  requiredFields: string[];
}

interface Events {
  (e: "update:modelValue", value: RawLocationValues): void;
  (e: "handleSelectPlace", place: SelectedPlace): void;
  (e: "handleDirectionTextChange", direction: string): void;
  (e: "handleRemoveVenue", venue: Venue): void;
}

const props = defineProps<RawLocationFormProps>();
const emits = defineEmits<Events>();

const model = useVModel(props, "modelValue", emits, {
  passive: true,
  deep: true,
});

const isMeetingPointDisabledDuringCuration = computed(() =>
  isDisabledDuringCuration("meeting_point_details", props.options.statusCode)
);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";
</style>
