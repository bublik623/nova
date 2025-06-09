import { Venue } from "@/types/generated/GeoMasterDataApi";

export type Venues = {
  name: string;
  code: string;
};

export const dummyVenuesData: Venue[] = [
  {
    id: "bc074518-598b-4c63-8736-6fb3deb75741",
    code: "DBV",
    name: "Test DBV",
    city: "DBV",
    latitude: 45.433639,
    longitude: 63.598854,
    address: "24 Hours of Le Mans",
    language_code: "en",
  },
  {
    id: "36de8529-dac6-445b-995a-eb956227002a",
    code: "DBV2",
    name: "Test DBV 2",
    city: "DBV",
    latitude: 45.433639,
    longitude: 63.598854,
    address: "Japan Cup, Tokyo Yushun, Yasuda Kinen",
    language_code: "en",
  },
  {
    id: "a2ed9445-6977-4360-88e3-9110f7c0bcba",
    code: "ZAD1",
    name: "Test ZAD 1",
    city: "ZAD",
    latitude: 45.433639,
    longitude: 63.598854,
    address: "Zadar address 1",
    language_code: "en",
  },
];
