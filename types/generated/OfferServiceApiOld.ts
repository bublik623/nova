// These types have been created manually based on the Catalog's Offer Service (PHP) and don't match the OpenApi definitions
// TODO: Delete this as soon as the new Offer Service is developed

// TODO: generate types instead of changing it
import { AvailableLanguage } from "../Language";

export type Error = { code: string; message?: string };

export enum ExperienceType {
  CALENDAR_TIMESLOTS = "CALENDAR-TIMESLOTS",
  CALENDAR_NO_TIMESLOTS = "CALENDAR-NO-TIMESLOTS",
  NO_CALENDAR_FIXED_END = "NO-CALENDAR-FIXED-END",
  NO_CALENDAR_FIXED_VALIDITY = "NO-CALENDAR-FIXED-VALIDITY",
}

export type Experience = {
  uuid: string;
  // TODO: generate types instead of changing it
  code?: string;
  type: ExperienceType;
  confirmation_time: string;
  cutoff_time: string;
  supplier: string;
  state?: string;
  currency: string;
};
export type RefundPolicy = {
  id?: string;
  experience: string;
  period: string;
  refund_type_code: string;
  value: number;
};
export type Pricing = {
  id?: string;
  name: string;
  holder: string;
  age_range: { from: number; to: number };
  tiers: Tiers;
  option: string;
  pricing_type: "person" | "group";
};
export type Option = {
  id: string;
  name: string;
  duration?: string;
  valid_for?: string;
  multilanguage: boolean;
  capacity_type: string;
  status?: string;
  experience: string;
  pricing_type_allowed?: "person" | "group";
};
export type DatesRange = { from?: string; to?: string };
export type Tiers = Array<TierItem>;
export type TierItem = {
  from: number;
  to: number;
  retail_price: number;
  commission: number;
  net_price: number;
};
export type Ticket = {
  name?: string;
  pricings: Array<{ pricing: string; capacity?: number | null }>;
  languages?: Array<{ language: string; capacity?: number | null }> | null;
  capacity?: number | null;
};
export type TimedTicket = { time?: string } & Ticket;
export type OpenTicket = {
  id?: string;
  option: string;
  expiration_date: string | null;
  expiration_days: number | null;
} & Ticket;

export type DateTicket = {
  id?: string;
  option: string;
  name: string;
  date_range: DatesRange;
  days: {
    "1"?: Ticket;
    "2"?: Ticket;
    "3"?: Ticket;
    "4"?: Ticket;
    "5"?: Ticket;
    "6"?: Ticket;
    "7"?: Ticket;
  };
};
export type DatetimeTicket = {
  id?: string;
  option: string;
  name: string;
  date_range: DatesRange;
  days: {
    "1"?: Array<TimedTicket> | null;
    "2"?: Array<TimedTicket> | null;
    "3"?: Array<TimedTicket> | null;
    "4"?: Array<TimedTicket> | null;
    "5"?: Array<TimedTicket> | null;
    "6"?: Array<TimedTicket> | null;
    "7"?: Array<TimedTicket> | null;
  };
};

export type ExperienceLanguages = {
  experience_id: string;
  // TODO: generate types instead of changing it
  languages: AvailableLanguage[];
};
