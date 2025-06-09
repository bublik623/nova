import { describe, vi, test, expect, beforeEach, Mock } from "vitest";
import { mount, config, VueWrapper, MountingOptions, flushPromises } from "@vue/test-utils";
import FieldMap, { FieldMapProps } from "../FieldMap.vue";
import * as useGoogleMapsApiModule from "@/features/google-maps/use-google-maps-api/useGoogleMapsApi";

config.global.mocks = {
  $t: (text: string) => text,
};

const getMapsLibraryMock = ({ setCenter }: { setCenter?: Mock<any, any> } = {}) =>
  ref({
    Map: vi.fn(() => ({
      setCenter: setCenter ? setCenter : vi.fn(),
    })),
  });
const getMarkerLibraryMock = ({ setPosition }: { setPosition?: Mock<any, any> } = {}) =>
  ref({
    Marker: vi.fn(() => ({
      setPosition: setPosition ? setPosition : vi.fn(),
    })),
  });

describe("FieldMap", () => {
  let wrapper: VueWrapper<InstanceType<typeof FieldMap>>;

  const defaultProps: FieldMapProps = {
    mapId: "test-map",
    center: {
      lat: 1,
      lng: 1,
    },
  };

  const render = (options: MountingOptions<FieldMapProps> = {}) => {
    wrapper = mount(FieldMap, {
      props: defaultProps,
      ...options,
    });
  };

  const findMapEl = () => wrapper.find("#test-map");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the map with the given center", async () => {
    const isGoogleMapsLoadedMock = ref(false);
    const markerLibraryMock = getMarkerLibraryMock();
    const mapsLibraryMock = getMapsLibraryMock();
    // @ts-expect-error
    vi.spyOn(useGoogleMapsApiModule, "useGoogleMapsApi").mockImplementation(() => {
      return {
        isGoogleMapsLoaded: isGoogleMapsLoadedMock,
        mapsLibrary: mapsLibraryMock,
        markerLibrary: markerLibraryMock,
      };
    });

    render();

    isGoogleMapsLoadedMock.value = true;
    await flushPromises();

    expect(findMapEl().exists()).toBe(true);

    expect(useGoogleMapsApiModule.useGoogleMapsApi).toHaveBeenCalled();
    expect(mapsLibraryMock.value!.Map).toHaveBeenCalled();
    expect(markerLibraryMock.value!.Marker).toHaveBeenCalled();
  });

  test("does not call renderMap fn if the center prop is not provided", async () => {
    const isGoogleMapsLoadedMock = ref(false);
    const markerLibraryMock = getMarkerLibraryMock();
    const mapsLibraryMock = getMapsLibraryMock();
    // @ts-expect-error
    vi.spyOn(useGoogleMapsApiModule, "useGoogleMapsApi").mockImplementation(() => {
      return {
        isGoogleMapsLoaded: isGoogleMapsLoadedMock,
        mapsLibrary: mapsLibraryMock,
        markerLibrary: markerLibraryMock,
      };
    });

    render({ props: { mapId: "no-center", center: undefined } });

    isGoogleMapsLoadedMock.value = true;
    await flushPromises();

    expect(mapsLibraryMock.value!.Map).not.toHaveBeenCalled();
    expect(markerLibraryMock.value!.Marker).not.toHaveBeenCalled();
  });

  test("updates the map center and marker position when the center prop changes", async () => {
    const isGoogleMapsLoadedMock = ref(false);
    const setCenterMock = vi.fn();
    const setPositionMock = vi.fn();
    const markerLibraryMock = getMarkerLibraryMock({ setPosition: setPositionMock });
    const mapsLibraryMock = getMapsLibraryMock({ setCenter: setCenterMock });
    // @ts-expect-error
    vi.spyOn(useGoogleMapsApiModule, "useGoogleMapsApi").mockImplementation(() => {
      return {
        isGoogleMapsLoaded: isGoogleMapsLoadedMock,
        mapsLibrary: mapsLibraryMock,
        markerLibrary: markerLibraryMock,
      };
    });

    render();

    isGoogleMapsLoadedMock.value = true;
    await flushPromises();

    const newCenter = { lat: 34.0522, lng: -118.2437 };
    await wrapper.setProps({ center: newCenter });

    expect(setCenterMock).toHaveBeenCalledWith(newCenter);
    expect(setPositionMock).toHaveBeenCalledWith(newCenter);
  });
});
