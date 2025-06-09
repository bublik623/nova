"use strict";
export type Error = { code?: string; message?: string };
export type Country = {
  id?: string;
  iso_code_alpha2: string;
  iso_code_alpha3: string;
  iso_code_numeric: number;
  name: string;
  language_code: string;
  description?: string;
  country_calling_codes: Array<number>;
};
export type AdministrativeDivision = {
  id?: string;
  code: string;
  name: string;
  country_code_alpha2: string;
  language_code: string;
  description: string;
  sub_administrative_divisions?: Array<string>;
};
export type City = {
  id?: string;
  code: string;
  name: string;
  country_code_alpha2: string;
  language_code: string;
  description?: string;
};
export type TimeZone = {
  id?: string;
  code: string;
  name: string;
  language_code: string;
  description?: string;
  location: string;
};
export type Airport = {
  id?: string;
  iata_code: string;
  icao_code?: string;
  name: string;
  latitude: number;
  longitude: number;
  ratio?: number;
};
//Temporary until BE updates openAPI
export type Venue = {
  id: string;
  code: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  language_code: string;
}
