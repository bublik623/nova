"use strict";
export type Error = { code?: string; message?: string };
export type PickupPlace = {
  id?: string;
  supplier_id: string;
  name: string;
  type: "Hotel" | "Airport" | "Port" | "Other";
  latitude: string;
  longitude: string;
  city: string;
  country?: string;
  address: string;
  labels?: Array<string>;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  created_at?: string;
};
