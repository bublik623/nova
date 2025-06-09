<template>
  <div ref="component">
    <NovaDropdown
      :options="suggestions.map((item) => ({ label: item.description, value: item.place_id, item }))"
      :show="isDropdownOpen"
      :loading="isDropdownLoading"
      :max-height="200"
      @select:option="handleSelect"
    >
      <template #toggle>
        <NovaInputText
          :id="fieldId"
          :model-value="searchText"
          :placeholder="placeholder"
          :disabled="disabled"
          left-icon="search"
          :readonly="readonly"
          :readonly-placeholder="$t('common.no-content')"
          @clear="emit('clear')"
          @update:model-value="handleInputUpdate"
        />
      </template>
    </NovaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { Option } from "@/types/Option";
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import { useGoogleMapsApi } from "@/features/google-maps/use-google-maps-api/useGoogleMapsApi";
import { useVModel, whenever } from "@vueuse/core";
import { getGeocode, getLatLng, usePlacesAutocomplete } from "@/features/google-maps/use-places-autocomplete";

export interface SelectedPlace {
  address: string;
  placeId: string;
  lat: number;
  lng: number;
  postalCode: string;
  item: google.maps.GeocoderResult;
}

export interface FieldPlaceSearchProps {
  fieldId: string;
  modelValue: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
}

interface Events {
  (event: "update:modelValue", value: string): void;
  (event: "select", selection: SelectedPlace): void;
  (event: "clear"): void;
}

const props = defineProps<FieldPlaceSearchProps>();
const emit = defineEmits<Events>();
const component = ref<Element | null>(null);

const searchText = useVModel(props, "modelValue", emit, { passive: true });
const { isGoogleMapsLoaded, placesLibrary } = useGoogleMapsApi();
const { suggestions, loading, initPlaces } = usePlacesAutocomplete(searchText, {
  debounce: 500,
  minLengthAutocomplete: 3,
  placesLibrary,
});

const isDropdownOpen = ref(false);
const isDropdownLoading = ref(false);

function handleInputUpdate(value: string) {
  searchText.value = value;

  if (value) {
    isDropdownLoading.value = true;
    isDropdownOpen.value = true;
  } else {
    isDropdownOpen.value = false;
  }
}

async function handleSelect(option: Option) {
  const selectedAddress = option.item as google.maps.places.AutocompletePrediction;
  searchText.value = selectedAddress.description;

  const geoResults = await getGeocode({ placeId: selectedAddress.place_id });
  const selectedAddressDetails = geoResults?.[0];
  const latLng = await getLatLng(selectedAddressDetails);

  const postalCode = selectedAddressDetails.address_components?.find((item) => {
    return item.types.find((type) => type === "postal_code");
  });

  emit("select", {
    placeId: selectedAddress.place_id,
    address: selectedAddress.description,
    lat: latLng.lat,
    lng: latLng.lng,
    postalCode: postalCode?.long_name || "",
    item: selectedAddressDetails,
  });

  isDropdownOpen.value = false;
}

watch(loading, () => {
  if (!loading.value) {
    isDropdownLoading.value = false;
  }
});

whenever(isGoogleMapsLoaded, initPlaces);

useDetectClickOutside(component, () => {
  isDropdownOpen.value = false;
});
</script>
