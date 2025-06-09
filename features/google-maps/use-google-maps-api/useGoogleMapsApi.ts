import { Loader } from "@googlemaps/js-api-loader";

export function useGoogleMapsApi() {
  const runtimeConfig = useRuntimeConfig();
  const apiKey = runtimeConfig.public.GOOGLE_MAPS_API_KEY;

  const isGoogleMapsLoaded = ref(false);
  const mapsLibrary = shallowRef<google.maps.MapsLibrary | undefined>();
  const placesLibrary = shallowRef<google.maps.PlacesLibrary>();
  const markerLibrary = shallowRef<google.maps.MarkerLibrary>();

  async function initalizeServices() {
    if (isGoogleMapsLoaded.value) {
      return;
    }

    try {
      const loader = new Loader({ apiKey, version: "weekly" });
      [mapsLibrary.value, placesLibrary.value, markerLibrary.value] = await Promise.all([
        loader.importLibrary("maps"),
        loader.importLibrary("places"),
        loader.importLibrary("marker"),
      ]);
    } catch (error) {
      console.error("[useGoogleMapsApi]: failed to init");
      console.error(error);
    } finally {
      isGoogleMapsLoaded.value = true;
    }
  }

  onMounted(async () => {
    await initalizeServices();
  });

  return { mapsLibrary, placesLibrary, markerLibrary, isGoogleMapsLoaded, _initalizeServices: initalizeServices };
}
