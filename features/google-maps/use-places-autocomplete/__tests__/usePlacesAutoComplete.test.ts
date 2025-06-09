import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlacesAutocomplete } from "../";
import { flushPromises } from "@vue/test-utils";
import { mockLoadComposableInApp } from "@/features/testing/utils/mock-load-composable-in-app";

export const getMockSuggestionsData = () => [
  {
    description: "Manila, Metro Manila, Philippines",
    matched_substrings: [
      {
        length: 6,
        offset: 0,
      },
    ],
    place_id: "ChIJi8MeVwPKlzMRH8FpEHXV0Wk",
    reference: "ChIJi8MeVwPKlzMRH8FpEHXV0Wk",
    structured_formatting: {
      main_text: "Manila",
      main_text_matched_substrings: [
        {
          length: 6,
          offset: 0,
        },
      ],
      secondary_text: "Metro Manila, Philippines",
    },
    terms: [
      {
        offset: 0,
        value: "Manila",
      },
      {
        offset: 8,
        value: "Metro Manila",
      },
      {
        offset: 22,
        value: "Philippines",
      },
    ],
    types: ["locality", "political", "geocode"],
  },
];
const mockSuggestionsData = getMockSuggestionsData();

type Suggestions = google.maps.places.AutocompletePrediction[] | null;

describe("usePlacesAutocomplete", () => {
  const getMaps = (type: "success" | "fail", data: Suggestions = null): any => ({
    maps: {
      places: {
        AutocompleteService: vi.fn(() => ({
          getPlacePredictions: (_: any, cb: (dataArg: Suggestions) => void) => {
            cb(type === "success" ? data : null);
          },
        })),
        AutocompleteSessionToken: vi.fn(),
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial object", async () => {
    global.google = getMaps("success", mockSuggestionsData);

    const query = ref("");

    const { result } = mockLoadComposableInApp(() =>
      usePlacesAutocomplete(query, { debounce: 0, placesLibrary: shallowRef(getMaps("success").maps.places) })
    );

    await result?.initPlaces();

    expect(result.suggestions.value).toEqual([]);
    expect(result.loading.value).toEqual(false);
    expect(result.sessionToken.value).toEqual({});
    expect(typeof result.refreshSessionToken).toBe("function");
  });

  it("should return correct suggestions", async () => {
    global.google = getMaps("success", mockSuggestionsData);

    const query = ref("");
    const { result } = mockLoadComposableInApp(() =>
      usePlacesAutocomplete(query, {
        debounce: 0,
        placesLibrary: shallowRef(getMaps("success", mockSuggestionsData).maps.places),
      })
    );

    await result.initPlaces();

    query.value = "manila";
    await flushPromises(); // wait for debounce
    expect(result.suggestions.value).toEqual(mockSuggestionsData);

    query.value = "";
    await flushPromises(); // wait for debounce
    expect(result.suggestions.value).toEqual([]);
  });
});
