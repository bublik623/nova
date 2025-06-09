import { useGoogleMapsApi } from "../useGoogleMapsApi";
import { beforeEach, describe, expect, it, vi } from "vitest";
import googleJsApi from "@googlemaps/js-api-loader";
import { mockUseRuntimeConfig } from "@/__mocks__/useRuntimeConfig";
import { mockLoadComposableInApp } from "@/features/testing/utils/mock-load-composable-in-app";
import { flushPromises } from "@vue/test-utils";

vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

const LoaderSpy = vi.spyOn(googleJsApi, "Loader");

describe("useGoogleMapsApi", () => {
  LoaderSpy.mockImplementation(
    // @ts-expect-error
    vi.fn(() => {
      return {
        importLibrary: vi.fn((library) => Promise.resolve(`Mocked ${library}`)),
      };
    })
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize Google Maps services and return the libraries", async () => {
    const { result } = mockLoadComposableInApp(() => useGoogleMapsApi());

    // Wait for the initialization to complete
    await flushPromises();

    const { mapsLibrary, placesLibrary, markerLibrary, isGoogleMapsLoaded } = result;

    expect(LoaderSpy).toHaveBeenCalledOnce();
    expect(isGoogleMapsLoaded.value).toBe(true);
    expect(mapsLibrary.value).toBe("Mocked maps");
    expect(placesLibrary.value).toBe("Mocked places");
    expect(markerLibrary.value).toBe("Mocked marker");
  });

  it("should not initialize Google Maps services if already loaded", async () => {
    const { result } = mockLoadComposableInApp(() => useGoogleMapsApi());

    const { _initalizeServices } = result;

    // Wait for the initialization to complete
    await flushPromises();

    // after the first init, try to init multiple times
    await _initalizeServices();
    await _initalizeServices();

    // Google Maps API Loader should be called just once
    expect(LoaderSpy).toHaveBeenCalledTimes(1);
  });
});
