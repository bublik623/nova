"use strict";
export type Error = { code?: string; message?: string };
export type Pickup = {
  id?: string;
  option_id: string;
  pickup_place_ids: Array<string>;
  tags?: Array<string>;
  starting_time?: string;
  status?: "ACTIVE" | "PUBLISHED" | "DRAFT" | "DELETED";
  contact_form?: ContactForm;
  supplier_id: string;
};
export type ContactForm = {
  contact_number?: ContactNumber;
  contact_email?: string;
};
export type ContactNumber = {
  country_iso_code: string;
  phone_prefix: string;
  phone_number: string;
};
