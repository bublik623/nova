"use strict";
export type Error = { code: string; message?: string };
export type Experience = {
  uuid: string;
  type:
    | "CALENDAR-TIMESLOTS"
    | "CALENDAR-NO-TIMESLOTS"
    | "NO-CALENDAR-FIXED-END"
    | "NO-CALENDAR-FIXED-VALIDITY";
  confirmation_time: string;
  cutoff_time: string;
  supplier: string;
  state?: string;
  currency: string;
};
export type RefundPolicy = {
  id?: string;
  experience_id: string;
  period: string;
  refund_type_code: string;
  value: number;
};
export type Pricing = {
  id?: string;
  name: string;
  holder: string;
  option_id?: string;
  age_range?: { from?: number; to?: number };
  tiers: Tiers;
  pricing_type?: "person" | "group";
};
export type Option = {
  id?: string;
  name: string;
  duration?: string;
  valid_for?: string;
  multilanguage: boolean;
  capacity_type: "unlimited" | "shared" | "pax" | "language";
  status?: string;
  code?: string;
  allowed_languages?: Array<OptionLanguage>;
  experience: string;
  pricing_type_allowed?: "person" | "group";
};
export type OptionLanguage = { language?: string };
export type OptionZones = { option_id?: string; zone_codes: ZoneCodes };
export type OptionPaxes = { option_id?: string; pax_list: Array<OptionPax> };
export type OptionPax = { pax_code: string };
export type DatesRange = { from?: string; to?: string };
export type Tiers = Array<TierItem>;
export type TierItem = {
  from?: number;
  to?: number;
  retail_price: number;
  commission: number;
  net_price: number;
};
export type Ticket = {
  name: string;
  pricings: Array<{ pricing_id: string; capacity?: number | null }>;
  languages?: Array<{ language: string; capacity?: number | null }> | null;
  capacity?: number | null;
};
export type TimedTicket = { time: string } & Ticket;
export type OpenTicket = OpenTicketExpirationDate | OpenTicketExpirationDays;
export type OpenTicketExpirationDate = {
  id?: string;
  option_id: string;
  expiration_date: string;
} & Ticket;
export type OpenTicketExpirationDays = {
  id?: string;
  option_id: string;
  expiration_days: number;
} & Ticket;
export type DateTicket = {
  id?: string;
  option_id: string;
  name: string;
  date_range: DatesRange;
  days?: {
    "1"?: unknown;
    "2"?: unknown;
    "3"?: unknown;
    "4"?: unknown;
    "5"?: unknown;
    "6"?: unknown;
    "7"?: unknown;
  } | null;
};
export type DatetimeTicket = {
  id?: string;
  option_id: string;
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
export type SpecialDate = {
  id?: string;
  option_id?: string;
  date_range?: DatesRange;
} & Ticket;
export type SpecialDatetime = {
  id?: string;
  option_id?: string;
  date_range?: DatesRange;
  timeslots?: Array<TimedTicket>;
};
export type Pax = {
  pax_type: "PERSON" | "GROUP";
  pax_code: string;
  all_ages: boolean;
  age_from?: number;
  age_to?: number;
  free_of_charge: boolean;
};
export type ExperiencePaxes = { experience_id: string; pax_list?: Array<Pax> };
export type ExperienceZones = { experience_id?: string; zone_codes: ZoneCodes };
export type ExperienceLanguages = {
  experience_id?: string;
  languages: LanguageCodes;
};
export type OptionLanguages = {
  option_id: string;
  language_codes: LanguageCodes;
};
export type ZoneCodes = Array<string>;
export type LanguageCodes = Array<string>;
export type Allotment = {
  id?: string;
  experience_id: string;
  option_id?: string;
  date_from: string;
  date_to: string;
  languages?: Array<string>;
  zones?: Array<string>;
  paxes?: Array<string>;
  monday?: number;
  tuesday?: number;
  saturday?: number;
  sunday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  is_locked?: boolean;
};
export type InternalPricing = {
  id?: string;
  languages?: Array<string>;
  zones?: Array<string>;
  days: Array<Day>;
  currency: string;
  date_from: string;
  date_to: string;
  option_id?: string;
  prices: Array<Price>;
};
export type Price = {
  pax: string;
  cost: number;
  suggested: number;
  initial: number;
};
export type Day = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
