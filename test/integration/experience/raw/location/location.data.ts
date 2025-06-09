import { ExperienceLocation, ExperienceVenues } from "@/types/generated/MetadataExperiencesApi";

export const mockLocationData: ExperienceLocation = {
  experience_id: "7e87fdf3-e96d-4783-9dac-2ecb957cf943",
  id: "test-id",
  name: "Alicante",
  latitude: "1",
  longitude: "2",
  address: {
    city: "XLC",
    country: "Spain",
    direction: "Location Text",
  },
};

export const mockVenues: ExperienceVenues = {
  experience_id: "test-experience-id",
  id: "test-venue-id",
  venues: ["ZAD1"],
};
