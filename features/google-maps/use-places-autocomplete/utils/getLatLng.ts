import type { LatLng } from "../types";

const getLatLng = async (result: google.maps.GeocoderResult): Promise<LatLng> => {
  const latLng: LatLng = {
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
  };
  return latLng;
};

export default getLatLng;
