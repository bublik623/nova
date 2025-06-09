<template>
  <div :id="mapId" class="map-wrapper"></div>
</template>
<script setup lang="ts">
import { useGoogleMapsApi } from "@/features/google-maps/use-google-maps-api/useGoogleMapsApi";
import { whenever } from "@vueuse/core";

export interface FieldMapProps {
  mapId: string;
  center?: {
    lat: number;
    lng: number;
  };
}

const props = defineProps<FieldMapProps>();

const { isGoogleMapsLoaded, mapsLibrary, markerLibrary } = useGoogleMapsApi();
const map = shallowRef<google.maps.Map>();
const marker = shallowRef<google.maps.Marker>();
const isMapRendered = ref(false);

function renderMap() {
  const mapsLibraryConstructor = mapsLibrary.value;

  if (!mapsLibraryConstructor) return;

  if (!props.center) return;
  const mapEl = document.getElementById(props.mapId)!;
  map.value = new mapsLibraryConstructor.Map(mapEl, {
    center: props.center,
    zoom: 18,
    disableDefaultUI: true,
    fullscreenControl: false,
  });
  marker.value = new markerLibrary.value!.Marker({ map: map.value });
  marker.value.setPosition(props.center);
  isMapRendered.value = true;
}

whenever(isGoogleMapsLoaded, renderMap);

// update location
watch(
  () => props.center,
  () => {
    if (!props.center) {
      return;
    }
    if (!isMapRendered.value) {
      renderMap();
    } else {
      map.value?.setCenter(props.center);
      marker.value?.setPosition(props.center);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
}
</style>
