<template>
  <DocumentFormSection id="location.city" :required="requiredFields.includes('location.city')" :slot-max-width="400">
    <FieldCity :model-value="city" :readonly="true" :options="cities" />
  </DocumentFormSection>

  <DocumentFormSection id="location.address" :required="requiredFields.includes('location.address')">
    <FieldPlaceSearch
      :model-value="values?.location?.address.direction ?? ''"
      field-id="field-address"
      :placeholder="$t('common.field.address.placeholder')"
      :readonly="true"
    />
    <div v-if="hasCoordinates" class="mt-4" style="height: 240px">
      <FieldMap map-id="field-map" :center="coords" />
    </div>
  </DocumentFormSection>

  <DocumentFormSection id="location.meeting-point" :required="requiredFields.includes('location.meeting-point')">
    <div class="mt-8">
      <NovaTextEditor
        :model-value="values?.meetingPointDetails"
        :placeholder="$t('experience.description.editor.placeholder')"
        :readonly="true"
        data-testid="curation-location-meeting-point"
      />
    </div>
  </DocumentFormSection>
</template>

<script setup lang="ts">
import FieldCity from "@/features/experience-shared/components/FieldCity.vue";
import { RevisionFormProps } from "../types/forms";
import FieldPlaceSearch from "@/features/experience-calendar/components/FieldPlaceSearch.vue";
import FieldMap from "@/features/experience-calendar/components/FieldMap.vue";
import NovaTextEditor from "@/ui-kit/NovaTextEditor/NovaTextEditor.vue";
import { useMasterData } from "@/stores/master-data";

const props = defineProps<RevisionFormProps>();

const masterdata = useMasterData();
const cities = masterdata.geoCities;

const city = computed(() => masterdata.getCityByCode(props.values?.location?.address.city ?? ""));

const coords = computed(() => ({
  lat: Number(props.values?.location?.latitude),
  lng: Number(props.values?.location?.longitude),
}));
const hasCoordinates = computed(() => {
  return coords.value.lat > 0 && coords.value.lng > 0;
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";
</style>
