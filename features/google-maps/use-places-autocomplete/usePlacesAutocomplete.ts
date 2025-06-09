import { reactive, toRefs, Ref } from "vue";
import type { AutocompletionRequest } from "./types";
import autocompletionRequestBuilder from "./helpers/autocompletionRequestBuilder";
import { watchDebounced } from "@vueuse/core";

export interface GooglePlacesAutocompleteOptions {
  autocompletionRequest?: AutocompletionRequest;
  debounce?: number;
  minLengthAutocomplete?: number;
  withSessionToken?: boolean;
  placesLibrary?: Ref<google.maps.PlacesLibrary | undefined>;
}

export default function usePlacesAutocomplete(
  query: Ref<string>,
  {
    placesLibrary,
    autocompletionRequest = {},
    debounce = 300,
    minLengthAutocomplete = 0,
    withSessionToken,
  }: GooglePlacesAutocompleteOptions = {}
) {
  interface State {
    placesService: google.maps.places.AutocompleteService | undefined;
    sessionToken: google.maps.places.AutocompleteSessionToken | undefined;
    suggestions: google.maps.places.AutocompletePrediction[];
    loading: boolean;
  }

  const state = reactive<State>({
    placesService: undefined,
    sessionToken: undefined,
    suggestions: [],
    loading: false,
  });

  const fetchSuggestions = () => {
    if (!state.placesService) {
      state.suggestions = [];
      return;
    }

    if (query.value.length < minLengthAutocomplete || !query.value.length) {
      state.suggestions = [];
      return;
    }

    const autocompletionReq: AutocompletionRequest = { ...autocompletionRequest };

    state.loading = true;

    state.placesService?.getPlacePredictions(
      autocompletionRequestBuilder(autocompletionReq, query.value, withSessionToken && state.sessionToken),
      (result) => {
        state.suggestions = result || [];
        state.loading = false;
      }
    );
  };

  const refreshSessionToken = () => {
    state.sessionToken = new google.maps.places.AutocompleteSessionToken();
  };

  /**
   * init service only
   */
  const initPlaces = () => {
    if (!placesLibrary?.value) {
      console.error("[vue-use-places-autocomplete]: Google script not loaded");
      return;
    }

    state.placesService = new placesLibrary.value.AutocompleteService();
    refreshSessionToken();
    fetchSuggestions();
  };

  watchDebounced(query, fetchSuggestions, { debounce });

  return {
    ...toRefs(state),
    refreshSessionToken,
    initPlaces,
  };
}
