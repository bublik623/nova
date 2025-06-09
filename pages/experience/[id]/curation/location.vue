<template>
  <DocumentFormSection v-show="isAllView" id="location.city" :required="fields.city.required" :slot-max-width="400">
    <FieldCity v-model="fields.city.value" :readonly="isReadonly || areNonCommercialFieldsReadonly" :options="cities" />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="location.additional-cities" class="max-w-[640px]">
    <FieldAdditionalCities
      v-model="fields.additionalCities.value"
      :options="cities"
      :disabled="isReadonly || areNonCommercialFieldsReadonly"
    />
    <FieldAdditionalCitiesList
      v-model="fields.additionalCities.value"
      class="mt-4"
      :disabled="isReadonly || areNonCommercialFieldsReadonly"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="location.venues" class="max-w-[640px]">
    <FieldVenues
      v-model="fields.venues.value"
      :options="venuesList"
      :disabled="isReadonly || areNonCommercialFieldsReadonly"
    />
    <FieldVenuesList
      :items="selectedVenueList"
      class="mt-4"
      :disabled="isReadonly || areNonCommercialFieldsReadonly"
      @remove="handleRemoveVenue"
    />
  </DocumentFormSection>

  <DocumentFormSection v-show="isAllView" id="location.address">
    <FieldPlaceSearch
      :model-value="fields.address.value.direction"
      field-id="field-address"
      :placeholder="$t('common.field.address.placeholder')"
      :readonly="isReadonly || areNonCommercialFieldsReadonly"
      @update:model-value="handleDirectionTextChange"
      @select="handleSelectPlace"
    ></FieldPlaceSearch>
    <div v-if="hasCoordinates" class="mt-4" style="height: 240px">
      <FieldMap
        map-id="field-map"
        :center="{ lat: fields.address.value.latitude, lng: fields.address.value.longitude }"
      ></FieldMap>
    </div>
  </DocumentFormSection>

  <DocumentFormSection id="location.meeting-point" :required="experienceRaw.fields.meeting_point_details.required">
    <div>
      <div v-show="showRawFields">
        <div class="mb-2">
          <NovaLabel theme="middle-grey">{{ $t("experience.curation.view-type.raw") }}</NovaLabel>
        </div>
        <div class="MeetingPoint__wrapper">
          <NovaTextEditor
            readonly
            :model-value="experienceRaw.fields.meeting_point_details.value"
            :placeholder="$t('experience.description.editor.placeholder')"
            data-testid="location-meeting-point"
          >
            <DiffHtml
              v-if="curationStore.hasDiff"
              :value="experienceRaw.fields.meeting_point_details.value"
              :old-value="rawSnapshot?.raw?.commercial?.meeting_point_details ?? ''"
            />
            <NoContentUtil v-if="isContentEmpty" />
          </NovaTextEditor>
        </div>
      </div>
      <div class="mt-8">
        <div class="mb-2">
          <NovaLabel theme="teal-green">{{ $t("experience.curation.view-type.commercial") }}</NovaLabel>
        </div>
        <NovaTextEditor
          v-model="experienceCuration.fields.meeting_point_details.value"
          :placeholder="$t('experience.description.editor.placeholder')"
          :readonly="isReadonly"
          data-testid="curation-location-meeting-point"
        />
      </div>
    </div>
  </DocumentFormSection>
</template>

<script setup lang="ts">
import { useExperienceLocationStore } from "@/features/experience-shared/stores/useExperienceLocationStore";
import FieldCity from "@/features/experience-shared/components/FieldCity.vue";
import { storeToRefs } from "pinia";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { useExperienceRaw } from "@/stores/experience-raw";
import { useExperienceCuration } from "@/stores/experience-curation";
import { eventBusCuration } from "@/features/experience-shared/composables/useEventBus";
import { saveCurationContent } from "@/features/experience-curation/lib/saveCurationContent";
import FieldPlaceSearch, { SelectedPlace } from "@/features/experience-calendar/components/FieldPlaceSearch.vue";
import FieldMap from "@/features/experience-calendar/components/FieldMap.vue";
import { useMasterData } from "@/stores/master-data";
import DiffHtml from "@/features/experience-shared/components/DiffHtml.vue";
import { CurationPageEvents, CurationPageProps } from "@/features/experience-curation/types";
import NovaLabel from "@/ui-kit/NovaLabel/NovaLabel.vue";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";
import FieldAdditionalCities from "@/features/experience-shared/components/FieldAdditionalCities.vue";
import FieldAdditionalCitiesList from "@/features/experience-shared/components/FieldAdditionalCitiesList.vue";
import FieldVenues from "@/features/experience-shared/components/FieldVenues.vue";
import FieldVenuesList from "@/features/experience-shared/components/FieldVenuesList.vue";
import { cloneDeep, isEqual } from "lodash";
import { computed, watch, onBeforeUnmount } from "vue";
import { Venue } from "@/types/generated/GeoMasterDataApi";
import { areNonCommercialFieldsEditableForUser, viewIsTypeAll } from "@/features/experience-curation/lib/viewTypeUtils";

const props = defineProps<CurationPageProps>();
const emit = defineEmits<CurationPageEvents>();

const masterdataStore = useMasterData();
const cities = masterdataStore.geoCities;

const locationStore = useExperienceLocationStore();
const experienceRawStore = useExperienceRaw();
const curationStore = useExperienceCuration();
const rawSnapshot = computed(() => curationStore.rawSnapshot);
const { params } = useRoute();
const id = params.id as string;
const isAllView = computed(() => viewIsTypeAll(props.selectedView));
const areNonCommercialFieldsReadonly = computed(() => !areNonCommercialFieldsEditableForUser());

const experienceRaw = computed(() => experienceRawStore.rawContents[id]);
const experienceCuration = computed(() => curationStore.curationDocuments[id]);

const { fields, hasCoordinates, cityCodes } = storeToRefs(locationStore);

const { $t } = useNuxtApp();

const isContentEmpty = computed(() => {
  const meetingPointDetailsValue = experienceRaw.value?.fields?.meeting_point_details?.value;
  const oldMeetingPointDetailsValue = rawSnapshot.value?.raw?.commercial?.meeting_point_details;
  return !meetingPointDetailsValue && !oldMeetingPointDetailsValue;
});

let experienceCurationFieldsInitialValue = cloneDeep(experienceCuration.value.fields);
let locationFieldsInitialValue = cloneDeep(locationStore.fields);

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

watch(
  // watch all the stores used in the page
  [() => experienceCuration.value.fields, () => locationStore.fields],
  ([currentExperienceCurationFields, currentLocationFields]) => {
    const anyChangeInExperienceCurationFields =
      !curationStore.isSaving && !isEqual(experienceCurationFieldsInitialValue, currentExperienceCurationFields);
    const anyChangeInLocationFields =
      !locationStore.isSaving && !isEqual(locationFieldsInitialValue, currentLocationFields);

    if (anyChangeInExperienceCurationFields || anyChangeInLocationFields) {
      emit("hasUnsavedChanges", true);
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

const stopBus = eventBusCuration.on(
  async (
    event,
    opt: { nextSection: string; publish: boolean; redirect: boolean; translate: boolean; force: boolean }
  ) => {
    if (event === "SAVE") {
      saveCurationContent({
        promise: async () => {
          const promises = [locationStore.saveLocation(id)];
          promises.push(locationStore.saveAdditionalCities(id));
          promises.push(locationStore.saveVenues(id));
          await Promise.all(promises);
        },
        afterSaving: () => {
          experienceCurationFieldsInitialValue = cloneDeep(experienceCuration.value.fields);
          locationFieldsInitialValue = cloneDeep(locationStore.fields);
          eventBusCuration.emit("SAVED", opt);
        },
        id,
        nextSection: opt?.nextSection,
        redirect: opt?.redirect,
        translate: opt?.translate,
        publish: opt?.publish,
        force: opt?.force,
      });
    }
  }
);

onBeforeUnmount(() => stopBus());
</script>
